const xhr = promisify(require('xhr'))
const qs = require('query-string')
const parallel = require('run-parallel')
const series = require('run-series')
const Cookies = require('js-cookie')
const GitHub = require('github-api')
const assoc = require('ramda/src/assoc')
const pathjoin = require('path').join
const yaml = require('js-yaml')

const config = {
  GITHUB_AUTH_URL: 'https://github.com/login/oauth/authorize',
  GITHUB_CLIENT: '1d8f959ece6eb757b542',
  GATEKEEPER_HOST: 'http://localhost:9999'
}

module.exports = {
  state: {
    token: '',
    user: {},
    repos: [],
    currentRepo: {
      items: [] // files and folders
    },
    currentFile: {
      content: '',
      filename: '',
      data: {}
    },
    schemas: {} // keyed by path
  },
  reducers: {
    receiveToken: (state, token) => ({ token }),
    receiveRepos: (state, repos) => {
      const reposNoUrls = removeUrlProps(repos)
      return { repos: reposNoUrls }
    },
    receiveRepoItems: (state, items) => {
      const newCurrentRepo = assoc('items', items, state.currentRepo)
      return { currentRepo: newCurrentRepo }
    },
    resetRepoItems: (state, data) => {
      const newCurrentRepo = assoc('items', [], state.currentRepo)
      return { currentRepo: newCurrentRepo }
    },
    receiveUser: (state, user) => ({ user }),
    receiveFile: (state, data) => ({ currentFile: data }),
    resetFile: (state, data) => ({ currentFile: module.exports.state.currentFile }),
    receiveSchema: (state, data) => {
      const { path, schema } = data
      const newSchemas = assoc(path, schema, state.schemas)
      return { schemas: newSchemas }
    }
  },
  effects: {
    login: (state, data, send, done) => {
      const params = {
        client_id: config.GITHUB_CLIENT,
        redirect_url: window.location.href,
        scope: 'public_repo'
      }
      const url = config.GITHUB_AUTH_URL + '?' + qs.stringify(params)
      window.location.href = url
    },
    fetchToken: async (state, authCode, send, done) => {
      const psend = promisify(send)
      const authURL = `${config.GATEKEEPER_HOST}/authenticate/${authCode}`

      try {
        const response = await xhr(authURL, { json: true })
        const token = response.body.token
        window.history.pushState({}, null, '/') // remove code from URL

        await Promise.all([
          psend('persistToken', token),
          psend('receiveToken', token)
        ])
      } catch (err) {
        done(new Error('Failed to retreive token'))
      }
    },
    persistToken: (state, token, send, done) => {
      Cookies.set('token', token)
      done()
    },
    fetchRepos: async (state, data, send, done) => {
      try {
        const user = new GitHub({ token: state.token }).getUser()
        const response = await user.listRepos()
        send('receiveRepos', response.data, done)
      } catch (err) {
        done(new Error('Failed to fetch list of repos'))
      }
    },
    fetchRepoItems: async (state, data, send, done) => {
      const psend = promisify(send)
      try {
        await psend('resetRepoItems')
        const { repoOwner, repoName, path } = data
        const repo = new GitHub({ token: state.token }).getRepo(repoOwner, repoName)
        const response = await repo.getContents(null, path, null)
        send('receiveRepoItems', response.data, done)
      } catch (err) {
        done(new Error('Failed to fetch repository items'))
      }
    },
    fetchUser: async (state, data, send, done) => {
      try {
        const user = new GitHub({ token: state.token }).getUser()
        const response = await user.getProfile()
        send('receiveUser', response.data, done)
      } catch (err) {
        done(new Error('Failed to fetch user profile'))
      }
    },
    fetchFile: async (state, data, send, done) => {
      const psend = promisify(send)
      try {
        await psend('resetFile')
        const { repoOwner, repoName, path } = data
        const repo = new GitHub({ token: state.token }).getRepo(repoOwner, repoName)
        const response = await repo.getContents(null, path, false)
        const filename = response.data.name
        const content = decode(response.data.content)
        const fileData = JSON.parse(content)
        send('receiveFile', { data: fileData, content, filename }, done)
      } catch (err) {
        console.error(err)
        done(new Error('Failed to parse data from file'))
      }
    },
    fetchSchema: async (state, data, send, done) => {
      try {
        const { repoOwner, repoName, path } = data
        const schemaPath = pathjoin(path, '_schema.yml')
        const repo = new GitHub({ token: state.token }).getRepo(repoOwner, repoName)
        const response = await repo.getContents(null, schemaPath, true)
        const schema = yaml.safeLoad(response.data)
        const payload = { path, schema }
        send('receiveSchema', payload, done)
      } catch (err) {
        done(new Error('Failed to parse schema file'))
      }
    },
    writeFile: async (state, data, send, done) => {
      try {
        const { repoOwner, repoName, path, formData } = data
        const fileName = path.split('/').pop()
        const commitMsg = `Updated ${fileName}`
        const branch = 'master'
        const content = JSON.stringify(formData, null, 2)

        const repo = new GitHub({ token: state.token }).getRepo(repoOwner, repoName)
        const response = await repo.writeFile(branch, path, content, commitMsg, {})
        console.log(response)
      } catch (err) {
        done(new Error('Failed to write file'))
      }
    }
  },
  subscriptions: {
    checkAuthCode: (send, done) => {
      const authCodeMatch = window.location.href.match(/\?code=([a-z0-9]*)/)
      if (authCodeMatch) {
        const authCode = authCodeMatch[1]
        series([
          (cb) => send('fetchToken', authCode, cb),
          (cb) => send('fetchUser', cb)
        ], done)
      }
    },
    checkCookie: (send, done) => {
      const token = Cookies.get('token')
      if (token) {
        series([
          (cb) => send('receiveToken', token, cb),
          (cb) => send('fetchUser', cb)
        ], done)
      }
    }
  }
}

function removeUrlProps (rows) {
  return rows.map((row) => {
    const newRow = {}
    for (let key in row) {
      if (key.substr(-3) !== 'url') {
        newRow[key] = row[key]
      }
    }
    return newRow
  })
}

function decode (content) {
  // Decode Base64 to UTF-8
  // https://developer.mozilla.org/en-US/docs/Web/API/window.btoa#Unicode_Strings
  return window.decodeURIComponent(window.escape(window.atob(content)))
}

function promisify (fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        return err ? reject(err) : resolve(result)
      })
    })
  }
}
