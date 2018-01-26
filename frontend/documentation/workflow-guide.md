# Workflow guide

When working on the OpenDesk project, you are advised to follow these guidelines:


## Always work on a separate branch

`develop` branch has the latest changes but you should never work directly on develop. Instead, create a feature or working branch and add/commit your changes to that.
When you are finished working on a feature, publish it to the git repo and to a pull request on Github.com.
The shell script `update-all.sh` is handy for updating the develop branch and running all the npm/gulp scripts to get a brand new build.

## Always be documenting

When you create a new widget or a better way of running the site or whatever, write a short description of it to add to the documentation folder. The documentation page comes with the project files under
[/documentation/](/documentation). Write it in there or add a README.md in the folder with the module/component that you're documenting (remember to supply a link from the main documentation).

You can access the documentation by browsing the [documentation folder on the github page.](https://github.com/magenta-aps/OpenDESK-UI/tree/develop/documentation)


## Naming conventions

Custom-made widgets, filters, directives, etc. should be named with a od prefix to indicate that they are particular to the OpenDesk project.
Here is an example from the notifications directive:
```
.directive('odNotifications'; function() {})

<od-notifications>

<ul class="od-notifylist">
```