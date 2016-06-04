define(function(require) {
    var ESCAPE_CODE = 27;

    var Backbone = require('backbone'),
        tmpl  = require('tmpl/game'),
        Game = require('../game/game');

    var GameView = Backbone.View.extend({
        template: tmpl,

        id: 'game',

        events: {
            'keydown': 'keyAction'
        },

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
        },

        keyAction: function(event) {
            var code = event.keyCode || event.which;
            
            if (code == ESCAPE_CODE) { 
                window.location.href = '/';  // TODO: modal window
            }
        } 
    });

    return GameView;
});
