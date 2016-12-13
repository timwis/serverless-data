const html = require('choo/html')

const Nav = require('../components/nav')

module.exports = (View) => (state, prev, send) => {
  return html`
    <main>
      ${Nav(state.user, loginCb)}
      <section class="section">
        ${View(state, prev, send)}
      </section>
    </main>
  `
  function loginCb () {
    send('login')
  }
}

