const html = require('choo/html')

module.exports = (crumbs) => {
  return crumbs.map((crumb) => html`
    <span class="crumb">
      <a href=${crumb.link}>
        ${crumb.label}
      </a>
    </span>
  `)
}
