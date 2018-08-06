import './header.module'

function importAll (r) {
  r.keys().forEach(r)
}

importAll(
  // including subdirectories, find all *.js files except those matching *.module.js
  require.context('./', true, /^(?!.*\.module\.js$).*\.js$/)
)
