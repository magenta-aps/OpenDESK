require(["converse"], function(converse_api) {
    var $ = converse_api.env.jQuery,
        _ = converse_api.env._,
        moment = converse_api.env.moment;


    // The following line registers your plugin.
    converse_api.plugins.add('odChatPlugin', {

        initialize: function() {
            var converse = this.converse;
            converse.on("connected", function () {
                console.log("Connected");
            });
            converse.on("reconnected", function () {
                console.log("Reconnected");
            });
            converse.on("disconnected", function () {
                console.log("Disconnected");
            });
        },

        myFunction: function() {
            // This is a function which does not override anything in
            // converse.js itself, but in which you still have access to
            // the protected "inner" converse object.
            var converse = this.converse;
            // Custom code comes here
            // ...
        },

        overrides: {
            // If you want to override some function or a Backbone model or
            // view defined inside converse, then you do that under this
            // "overrides" namespace.

            // For example, the inner protected *converse* object has a
            // method "onConnected". You can override that method as follows:
            onConnected: function() {
                // Overrides the onConnected method in converse.js

                // Top-level functions in "overrides" are bound to the
                // inner "converse" object.
                var converse = this;
                this._super.onConnected.apply(this, arguments);
                converse.controlboxtoggle.show();
            },

            onDisconnected: function() {
                var converse = this;
                this._super.onDisconnected.apply(this, arguments);
                converse.controlboxtoggle.hide();
            },

            ControlBoxView: {
                render: function() {
                    var converse = this._super.converse;
                    this.$el.html(converse.templates.controlbox(
                        _.extend(this.model.toJSON(), {
                            sticky_controlbox: converse.sticky_controlbox
                        })));
                    if (!converse.connection.connected || !converse.connection.authenticated || converse.connection.disconnecting) {
                        //this.renderLoginPanel();
                    } else if (!this.contactspanel || !this.contactspanel.$el.is(':visible')) {
                        this.renderContactsPanel();
                    }
                    return this;
                }
            }
        }
    });
});
