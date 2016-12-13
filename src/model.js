const xhr = require('xhr')
const qs = require('query-string')
const parallel = require('run-parallel')
const series = require('run-series')
const Cookies = require('js-cookie')
const GitHub = require('github-api')
const assoc = require('ramda/src/assoc')

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
      contents: {}
    }
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
    receiveFile: (state, contents) => {
      const newCurrentFile = assoc('contents', contents, state.currentFile)
      return { currentFile: newCurrentFile }
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
    fetchToken: (state, authCode, send, done) => {
      const authURL = `${config.GATEKEEPER_HOST}/authenticate/${authCode}`

      xhr(authURL, { json: true }, (err, res, body) => {
        if (err || res.statusCode !== 200) return done(new Error('Failed to retrieve token'))
        window.history.pushState({}, null, '/') // remove code from URL
        parallel([
          (cb) => send('persistToken', body.token, cb),
          (cb) => send('receiveToken', body.token, cb)
        ], done)
      })
    },
    persistToken: (state, token, send, done) => {
      Cookies.set('token', token)
      done()
    },
    fetchRepos: (state, data, send, done) => {
      const user = new GitHub({ token: state.token }).getUser()
      user.listRepos((err, result) => {
        if (err) return done(new Error('Failed to fetch list of repos'))
        send('receiveRepos', result, done)
      })
    },
    fetchRepoItems: (state, data, send, done) => { // files and folders
      send('resetRepoItems', () => {
        const { repoOwner, repoName, path } = data
        const repo = new GitHub({ token: state.token }).getRepo(repoOwner, repoName)
        repo.getContents(null, path, null, (err, result) => {
          if (err) return done(new Error('Failed to fetch repository items'))
          send('receiveRepoItems', result, done)
        })
      })
    },
    fetchUser: (state, data, send, done) => {
      const user = new GitHub({ token: state.token }).getUser()
      user.getProfile((err, result) => {
        if (err) return done(new Error('Failed to fetch user profile'))
        send('receiveUser', result, done)
      })
    },
    fetchFile: (state, data, send, done) => {
      const { repoOwner, repoName, path } = data
      const repo = new GitHub({ token: state.token }).getRepo(repoOwner, repoName)
      repo.getContents(null, path, true, (err, result) => {
        if (err) return done(new Error('Failed to fetch file contents'))
        console.log(result)
        send('receiveFile', result, done)
      })
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

