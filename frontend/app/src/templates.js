function importTemplates (name) {
  const ctx = require.context('./', true, /.*\.html$/)

  angular.module(name).run([
    '$templateCache',
    function ($templateCache) {
      ctx.keys().forEach(key => {
        $templateCache.put(key.replace('./', `${name}/`), ctx(key))
      })
    }
  ])
}

// import templates by module
importTemplates('openDeskApp')
