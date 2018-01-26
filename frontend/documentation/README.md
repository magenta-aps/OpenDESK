#Documentation for OpenDesk development

Hi there. If you want to develop on OpenDesk, you've come to the right place.
Documentation now uses Markdown notation for ease of editing. [Learn markdown.](https://help.github.com/articles/basic-writing-and-formatting-syntax/)

* [Getting started guide](/documentation/getting-started-guide.md)

* [Workflow guide](/documentation/workflow-guide.md)

* [Use cases](/documentation/userstories.md)


## Modules

This area contains information specific to the various modules that OpenDesk app is made of.

* [Projects](/app/src/sites/README.md)

* [Chat module (odChat)](/app/src/odChat/README.md)


## Widgets

Custom widgets are listed here along with tips on how to implement them.

* [Dashboard tiles](/documentation/dashboard-tiles.md)

* [Flyout](/documentation/flyout.md)


## Technical info

Here are some technical details for developers.


### Problems with refresh when working with dialogs

We have had problems with refresh of components when working in a dialog. This is a problem caused by not beeing in the same scope.
The solution is to pass on the current scope to the dialog. Your component then has to be a part of the scope
It is illustrated in the following

```
// put your variable in the $scope
$scope.members = [];

// pass the current scope to your component
vm.uploadDocumentsDialog = function (event) {
    $mdDialog.show({
        templateUrl: 'app/src/sites/view/uploadDocuments.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: event,
        scope: $scope,        // use parent scope in template
        preserveScope: true,  // do not forget this if use parent scope
        clickOutsideToClose: true
    });
};

```

**Gotchas**
Don't add the controller again in the template, this will make refresh fail

```
<md-dialog aria-label="New member" ng-controller="SiteController as siteCtrl" ng-cloak>
```

If you do like above, the refresh will fail as the controller is loaded again. You dont need to add the controller, the variables are already available.


### Public site

A publicly facing site running OpenDesk can be found at http://staging.opendesk.dk/#!/login


### Gulp

Gulp is a script handler that helps you build the site on the fly while developing. A complete build can be done by going to your project's dir in a terminal and running
```
$ gulp build
```
The gulp build task both compiles your JS and CSS, and runs a security check for known vunerabilities using Node Security Project.
To have Gulp watch and concatenate your SASS files when you edit them, use
```
$ gulp watch
```


### Git

You can make git remember your username for every push by going to console and entering
```
$ git config credential.username yourusername
```
Read more info on working with git in the workflow guide below and check the [git cheat sheet.](/documentation/git-cheat-sheet.md)


## How to update the staging environment

The staging site can be accessed at http://staging.opendesk.dk/#!/

In order to update its codebase, log on to the server with your user via ssh:
```
ssh my-user@staging.opendesk.dk
```
change to the folder where staging is setup:
```
cd /var/www/staging/OpenDESK-UI/
```

change the user to the magenta user, as it is the owner of code repository:
First:
```
sudo bash 
```

You will be prompted for your own user's password after which you can then switch to the magenta user:
```
su magenta 
```
You then need to pull down the latest code base and compile and build the code: 
To pull from github:
```
git pull
```

now build the project and update any newly added dependencies
```
npm update
npm i  // (You might be prompted to enter which version of a dependency you'd like to use)

gulp build  // (to build the files.)
```

finally exit back to your user shell then restart the apache server
```
exit // exits from the 'magenta' user to the root shell
exit // exits from the 'root' shell you your user shell
sudo service apache2 restart  // (you will be prompted for your own password)
```
