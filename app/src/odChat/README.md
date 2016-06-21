# Chat integration

The **odChat** module ([`/app/src/odChat/`](/app/src/odChat/)) integrates [ConverseJS](https://conversejs.org/) chat into OpenDesk.
odChat supplies an `odChat` directive that can be inserted into any view like this:
```
<od-chat></od-chat>
```
The magic happens inside [ChatController.js](/app/src/odChat/ChatController.js) where you initialize the chat with:
```
converse.initialize({
    bosh_service_url: '/http-bind', // Please use this connection manager only for testing purposes
    i18n: locales.en, // Refer to ./locale/locales.js to see which locales are supported
    show_controlbox_by_default: true,
    roster_groups: true
});
```
Please refer to the [ConverseJS documentation](https://conversejs.org/docs/html/index.html) for more info about initializing the chat module.


## ConverseJS is a separate project 

OpenDesk uses a fork of the converseJS project which resides at [https://github.com/magenta-aps/converse.js.git](https://github.com/magenta-aps/converse.js.git)
If you want to make changes to the custom converseJS repository, clone the project then run:
```
make dist
```
in the root of the converseJS project to build the project.
The new files can be commited and pushed to the repository.
The next time you build openDESK-UI with gulp it will fetch your changes through bower.
