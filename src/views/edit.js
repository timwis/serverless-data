const html = require('choo/html')
const assoc = require('ramda/src/assoc')
const getFormData = require('get-form-data')

const Breadcrumbs = require('../components/breadcrumbs')
const Field = require('../components/field')

module.exports = (state, prev, send) => {
  const path = state.location.search.path
  const prevPath = prev ? prev.location.search.path : ''
  const { repoOwner, repoName } = state.location.params
  const prevRepoOwner = prev && prev.location.params.repoOwner
  const prevRepoName = prev && prev.location.params.repoName
  const dir = getDir(path)
  const schema = state.schemas[dir]

  if (hasRepoOrPathChanged()) {
    const payload = { repoOwner, repoName, path }
    send('fetchFile', payload)

    if (!schema) {
      const payload = { repoOwner, repoName, path: dir }
      send('fetchSchema', payload)
    }
  }

  const crumbs = constructCrumbs(repoOwner, repoName, path)
  const contents = state.currentFile.contents

  return html`
    <div class="container">
      <nav class="panel">
       <p class="panel-heading breadcrumbs">
         ${Breadcrumbs(crumbs)}
       </p>
      </nav>
      ${schema ? Form(schema, contents, submitCb) : ''}
    </div>
  `

  function hasRepoOrPathChanged () {
    return (repoOwner !== prevRepoOwner ||
            repoName !== prevRepoName ||
            path !== prevPath)
  }

  function submitCb (formData) {
    const payload = { repoOwner, repoName, path, formData }
    send('writeFile', payload)
  }
}

function Form (fields, data, submitCb) {
  return html`
    <form onsubmit=${onSubmit}>
      ${fields.map((field) => {
        const value = data[field.name]
        const fieldWithData = assoc('value', value, field)
        return Field(fieldWithData)
      })}
      <p class="control">
        <button type="submit" class="button is-primary">Submit</button>
      </p>
    </form>
  `
  function onSubmit (e) {
    if (submitCb) {
      const formData = getFormData(e.target)
      submitCb(formData)
    }
    e.preventDefault()
  }
}

function constructCrumbs (repoOwner, repoName, path) {
  const crumbs = [
    { link: '/', label: repoOwner },
    { link: `/${repoOwner}/${repoName}`, label: repoName }
  ]

  if (path) {
    const pathItems = path.split('/')
    pathItems.forEach((item, index) => {
      // construct the path up to this item
      const itemPath = pathItems.slice(0, index + 1).join('/')
      const crumb = {
        link: `/${repoOwner}/${repoName}?path=${itemPath}`,
        label: item
      }
      crumbs.push(crumb)
    })
  }

  return crumbs
}

function getDir (path) {
  const lastSlashIndex = path.lastIndexOf('/')
  if (lastSlashIndex === -1) {
    return '' // root dir
  } else {
    return path.substr(0, lastSlashIndex)
  }
}
