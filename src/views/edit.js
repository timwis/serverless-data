const html = require('choo/html')

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
    send('fetchFile', payload)
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
      ${contents ? JSON.stringify(contents, null, 2) : ''}
    </div>
  `
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
