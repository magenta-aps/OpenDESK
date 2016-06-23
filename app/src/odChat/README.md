# Chat integration

The **odChat** module ([`/app/src/odChat/`](/app/src/odChat/)) integrates [ConverseJS](https://conversejs.org/) chat into OpenDesk.
odChat supplies an `odChat` directive that can be inserted into any view like this:
```
<od-chat></od-chat>
```
The [ChatController.js](/app/src/odChat/ChatController.js) initializes the chat using the [chatService.js](/app/src/odChat/chatService.js):
```
chatService.initialize();
```
Please refer to the [ConverseJS documentation](https://conversejs.org/docs/html/index.html) for more info about initializing the chat module.


## Chat messages

ConverseJS enables you to do some programmatic stuff with chat.
The `connverse` object found in chatService.js has a `send` method to send messages in the XMPP format. An example of a message could look like this:
```
var msg = converse
          .env
          .$msg({
            to: 'user@xmppserver.org', // Reciever of the msg
            from: 'otheruser@xmppserver.org', // Sender of the msg. 
            // In many contexts, converseJS will automatically supply 'from' info
            id: 123,
            type: 'chat' // or 'groupchat'
          })
          .c('body')
          .t(
            'This is the message sent.'
          )
          .up()
          .c('active', {
              'xmlns': 'http://xmppserver.org/protocol/chatstates'
          })
          .tree();

converse.send(msg);
```
At the time of writing, I honestly don't know what half of the code does. But taking this bit and switching the `to:`, `id:`, `xmlns:`, and `t()` variables will make it miracously work.


## ConverseJS is a separate project 

OpenDesk uses a fork of the converseJS project which resides at [https://github.com/magenta-aps/converse.js.git](https://github.com/magenta-aps/converse.js.git)
If you want to make changes to the custom converseJS repository, clone the project then run:
```
make dist
```
in the root of the converseJS project to build the project.
The new files can be commited and pushed to the repository.
The next time you build openDESK-UI with gulp it will fetch your changes through bower.

If you want to make some changes locally in converse.js and try them out without pushing
them to GitHub, then you can use `bower link`. In your converse.js directory, run:
```
bower link
```

Then, in your OpenDESK-UI directory, run:
```
bower link converse.js
```

This sets up a symlink, so that any change you make in converse.js locally will immediately be available
in OpenDesk. Note that you still must run `make dist` in converse.js to build it.
