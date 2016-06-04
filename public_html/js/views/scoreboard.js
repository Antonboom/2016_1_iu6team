define(function(require) {

    var Backbone = require('backbone'),
        players =  require('collections/players'),
        tmpl = require('tmpl/scoreboard');

    var PlayerScoreView = Backbone.View.extend({
        collection: players,

        template: tmpl,

        id: 'scoreboard',

        initialize: function () {
            // TODO: this.listenTo(this.collection, "change", this.render);
        },

        render: function () {
            var context = {
                players: this.collection
            }

            this.$el.html(this.template(context));

            return this;
        },

        show: function () {
            this.trigger('show');
            this.$el.show();
        },

        hide: function () {
            this.$el.hide();
        }
    });

    return PlayerScoreView;
});
