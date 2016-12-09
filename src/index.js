const choo = require('choo')

const Layout = require('./views/layout')
const HomeView = require('./views/home')
const RepoView = require('./views/repo')

const app = choo()

if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-log')())
}

app.model(require('./model'))

app.router((route) => [
  route('/', Layout(HomeView)),
  route('/repos/:repoOwner/:repoName', Layout(RepoView))
])

const tree = app.start()
document.body.appendChild(tree)
