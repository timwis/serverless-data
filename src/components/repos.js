const html = require('choo/html')

module.exports = (repos) => {
  return html`
    <nav class="panel">
      <p class="panel-heading">
        Repositories
      </p>
      ${repos.map((repo) => html`
        <a href="/${repo.owner.login}/${repo.name}" class="panel-block">
          <span class="panel-icon">
            <i class="fa fa-book"></i>
          </span>
          ${repo.name}
        </a>
      `)}
    </nav>
  `
}
