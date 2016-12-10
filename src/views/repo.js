const html = require('choo/html')
const qs = require('query-string')

module.exports = (state, prev, send) => {
  const query = getQuery(state.location.pathname)
  const prevQuery = getQuery(prev.location.pathname || '')
  const path = query.path || ''
  const prevPath = prevQuery.path || ''
  const { repoOwner, repoName } = state.params

  if (repoOwner !== prev.params.repoOwner ||
      repoName !== prev.params.repoName ||
      path !== prevPath) {
    const payload = { repoOwner, repoName, path }
    send('fetchRepoItems', payload)
  }

  const directories = state.currentRepo.items.filter((item) => item.type === 'dir')
  const files = state.currentRepo.items.filter((item) => item.type === 'file')
  const pathItems = path.split('/')

  return html`
    <div class="container">
      <nav class="panel">
        <p class="panel-heading">
          <a href="/">${repoOwner}</a> /
          <a href="/${repoOwner}/${repoName}">
            ${repoName}
          </a>

          ${pathItems.map((item, index) => {
            const itemPath = pathItems.slice(0, index + 1).join('/')
            return html`
              <a href="/${repoOwner}/${repoName}?path=${itemPath}">
                ${item}
              </a>
            `
          })}
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
