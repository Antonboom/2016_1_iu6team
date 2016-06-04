define([
    'backbone',
    'tmpl/main',
    '../models/session'
], function(
    Backbone,
    tmpl,
    activeSession
) {
    var MainView = Backbone.View.extend({
        template: tmpl,

        id: 'main',

        model: activeSession,

        events: {
            'click .js-sign-out-btn': 'signout'
        },

        initialize: function() {
            // TODO: this.listenTo(...)
        },

        render: function() {
            var session = this.model;

            var session_context = {
                    signedFlag: session.isSigned(),
                    unsignedFlag: !session.isSigned(),
                    avatar: session.getUser().get('avatar'),
                    nickname: session.getUser().get('login'),
                    score: session.getUser().asPlayer().score
                };
            
            this.$el.html(this.template(session_context));
            return this;
        },

        show: function () {
            this.trigger('show');
            this.$el.show();
        },

        hide: function () {
            this.$el.hide();
        },

        signout: function() {
            var session = this.model;

            session.destroy({ wait: true });
        }
    });

    return MainView;
});
