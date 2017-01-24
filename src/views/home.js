const html = require('choo/html')

const Repos = require('../components/repos')

module.exports = (state, prev, send) => {
  return state.user.login ? html`
    <div class="container" onload=${() => send('fetchRepos')}>
      ${state.repos.length ? Repos(state.repos) : ''}
    </div>
  ` : html`
    <div class="container">
      Login to view repos
    </div>
  `
}
