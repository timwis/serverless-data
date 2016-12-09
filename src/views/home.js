const html = require('choo/html')

const Repos = require('../components/repos')

module.exports = (state, prev, send) => {
  return html`
    <div class="container">
      ${state.repos.length ? Repos(state.repos) : ''}
    </div>
  `
}
