const html = require('choo/html')
const qs = require('query-string')

const Breadcrumbs = require('../components/breadcrumbs')

module.exports = (state, prev, send) => {
  const path = state.location.search.path
  const prevPath = prev ? prev.location.search.path : ''
  const { repoOwner, repoName } = state.location.params
  const prevRepoOwner = prev && prev.location.params.repoOwner
  const prevRepoName = prev && prev.location.params.repoName


  if (repoOwner !== prevRepoOwner ||
      repoName !== prevRepoName ||
      path !== prevPath) {
    const payload = { repoOwner, repoName, path }
    send('fetchRepoItems', payload)
  }

  const crumbs = constructCrumbs(repoOwner, repoName, path)
  const repoItems = state.currentRepo.items
  const directories = repoItems.filter((item) => item.type === 'dir')
  const files = repoItems.filter((item) => item.type === 'file')


  return html`
    <div class="container">
      <nav class="panel">
        <p class="panel-heading breadcrumbs">
          ${Breadcrumbs(crumbs)}
        </p>
        ${directories.map((item) => html`
          <a href="/${repoOwner}/${repoName}?path=${item.path}" class="panel-block">
            <span class="panel-icon">
              <i class="fa fa-folder"></i>
            </span>
            ${item.name}
          </a>
        `)}
        ${files.map((item) => html`
          <a href="/${repoOwner}/${repoName}/edit?path=${item.path}" class="panel-block">
            <span class="panel-icon">
              <i class="fa fa-file-text-o"></i>
            </span>
            ${item.name}
          </a>
        `)}
      </nav>
    </div>
  `
}

function getQuery (fullPath) {
  const queryString = fullPath.substr(fullPath.indexOf('?') + 1)
  return qs.parse(queryString)
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
