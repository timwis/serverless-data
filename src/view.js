const html = require('choo/html')

const Nav = require('./components/nav')

module.exports = (state, prev, send) => {
  if (state.user !== prev.user) {
    send('fetchRepos')
  }

  return html`
    <main>
      ${Nav({}, loginCb)}
      <section class="section">
        <div class="container">
          Hello, world ${state.token}
          
          ${state.repos.length > 0 ? Repos(state.repos) : ''}
        </div>
      </section>
    </main>
  `
  function loginCb () {
    send('login')
  }
}

function Repos (repos) {
  return html`
    <nav class="panel">
      <p class="panel-heading">
        Repositories
      </p>
      ${repos.map((repo) => html`
        <a href="/repos/${repo.name}" class="panel-block">
          ${repo.name}
        </a>
      `)}
    </nav>
  `
}
