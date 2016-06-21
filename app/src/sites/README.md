# Projects (sites)

Projects (projekter) are navigated using states defined in [app.module.js](/app/src/app.module.js).
There is a project state for individual project views.
They are defined like so:
```
.state('projects', {
    parent: 'site',
    url: '/projekter',
    views: {
        'content@': {
            templateUrl: 'app/src/sites/view/site.html',
            controller: 'SitesController',
            controllerAs: 'vm'
        }
    },
    data: {
        authorizedRoles: [USER_ROLES.user]
    }
}).state('project', {
    parent: 'site',
    url: '/projekter/:projekt',
    views: {
        'content@': {
            templateUrl: 'app/src/sites/view/sites.html',
            controller: 'SitesController',
            controllerAs: 'vm'
        }
    },
    data: {
        authorizedRoles: [USER_ROLES.user],
        selectedTab: 0
    }
})
```
:projekt is a variable for an individual project.

In SitesController:
```
vm.projekt = $stateParams.projekt;
```

In sites.html:
```
<ul class="od-list">
    <li ng-repeat="project in vm.sites">
        <a href="#/projekter/{{project.shortName}}"><i class="material-icons">work</i>  {{ project.title }}</a></li>
</ul>
```
... er der et link til den nye "state" defineret i app.module.js Man kan så bruge samme princip for at lave navigering på folder niveau, hvor site.html tilpasses med et link til niveauet under.
