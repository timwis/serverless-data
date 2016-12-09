const html = require('choo/html')

module.exports = (state, prev, send) => {
  const { repoOwner, repoName } = state.params
  if (repoOwner !== prev.params.repoOwner ||
      repoName !== prev.params.repoName) {
    send('fetchRepoItems', state.params)
  }
  return html`
    <div class="container">
      <nav class="panel">
        <p class="panel-heading">
          ${repoOwner} / ${repoName}
        </p>
        ${state.currentRepo.items.map((item) => html`
          <a href="/repos/${repoOwner}/${repoName}/${item.path}" class="panel-block">
            ${item.name}
          </a>
        `)}
      </nav>
    </div>
  `
}
