const choo = require('choo')

const Layout = require('./views/layout')
const HomeView = require('./views/home')
const RepoView = require('./views/repo')
const EditView = require('./views/edit')

const app = choo()

if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-log')())
}

app.model(require('./model'))

app.router([
  ['/', Layout(HomeView)],
  ['/:repoOwner/:repoName', Layout(RepoView)],
  ['/:repoOwner/:repoName/edit', Layout(EditView)]
])

const tree = app.start()
document.body.appendChild(tree)
