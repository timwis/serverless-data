const html = require('choo/html')

module.exports = (repos) => {
  return html`
    <nav class="panel">
      <p class="panel-heading">
        Repositories
      </p>
      ${repos.map((repo) => html`
        <a href="/repos/${repo.owner.login}/${repo.name}" class="panel-block">
          ${repo.name}
        </a>
      `)}
    </nav>
  `
}
