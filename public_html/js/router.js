define(function(require) {
    
    var Backbone = require('backbone'),
        MainView = require('views/main'),
        SignInView = require('views/sign-in'),
        ScoreboardView = require('views/scoreboard'),
        GameView = require('views/game'),
        SignUpView = require('views/sign-up');
        activeSession = require('models/session');

    var app = require('views/app');
    app.setViews({
        'main': MainView,
        'signIn': SignInView,
        'scoreboard': ScoreboardView,
        'game': GameView,
        'signUp': SignUpView
    });

    var Router = Backbone.Router.extend({
        initialize: function() {
            this.listenTo(activeSession, 'status:received', this.hidePreloader);
            this.listenTo(activeSession, 'logout', this.rootAction);
        },

        routes: {
            'scoreboard': 'scoreboardAction',
            'game': 'gameAction',
            'signup': 'signUpAction',
            'signin': 'signInAction',
            '*default': 'defaultActions'
        },

        defaultActions: function () {
            // TODO: 404_view
            this.showPreloaderView('main')
        },

        scoreboardAction: function () {
            tapp.getView('scoreboard').show();
        },

        gameAction: function () {
            this.showPreloaderView('game');
        },

        signInAction: function () {
            app.getView('signIn').show();
        },
        
        signUpAction: function () {
            app.getView('signUp').show();
        },

        rootAction: function() {
            // this.navigate('/', {trigger: true});     // not working
            $(location).attr('href', '/');
        },

        showPreloaderView: function(viewName) {
            app.showPreloader();
            this.listenTo(
                activeSession, 
                'statusReceived',
                function() {
                    app.hidePreloader();
                    app.getView(viewName).show();
                }
            );
        },

        hidePreloader: function() {
            app.hidePreloader();
        }
    });

    return new Router();
});
