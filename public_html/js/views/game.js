define(function(require) {
    var Backbone = require('backbone'),
        tmpl  = require('tmpl/game'),
        Game = require('../game/game');

    var GameView = Backbone.View.extend({
        template: tmpl,

        id: 'game',

        initialize: function () {          
            // TODO
        },

        render: function() {
            this.$el.html(this.template());
            return this;
        },

        show: function () {
            this.trigger('show');
            this.$el.show();   

            var gameField = this.$el.find('.js-game-field')[0];
            var game = new Game(gameField);
            
            game.start();
            
            var view = this;
           /* this.listenTo(game, 'hurt', function() {
                var $hurt = view.$el.find('.js-hurt');
                $hurt.fadeIn(75);
                $hurt.fadeOut(350);
            });*/
        },

        hide: function () {
            this.$el.hide();
        }
    });

    return GameView;
});
