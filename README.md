# OpenDesk UI for AngularJS

OpenDesk UI is a collaboration web app that grant users easy access to Alfresco repository and a range of other services combined with chat and simple workflow tools.

## Setting up and running OpenDesk-UI

You'll want to clone the git repo and get it running. We assume you have an Apache server and Alfresco installation already set up, but you'll need to add a little extra magic.

First, clone the Git repo. In a terminal, go to your home dir and enter the following commands:
```
$ git clone https://github.com/magenta-aps/OpenDESK-UI.git
$ cd ~/www/OpenDESK-UI
$ ./update-all.sh 
```
*Note:* The above _update-all_ command might take a while. Enter "3" if it asks you about selecting versions for translation package)

When you change .scss (SASS) files in the project, you'll want to run a watcher that grabs your code and compiles new CSS on the fly. You can make that happen by running the gulp watch command in your project directory:
```
$ gulp watch
```
Happy coding :)

If you want to run OpenDesk-UI against an Alfresco server running on localhost and ejabberd running on demo.opendesk.dk, then run:
```
$ gulp local
```

If you want to run it against the demo.opendesk.dk Alfresco/ejabberd server, then run:
```
$ gulp demo
```
