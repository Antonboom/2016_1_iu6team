define([
    'backbone',
    './sessionSync',
    './user',
    'promisepolly'  // for QUnit
], function (
    Backbone,
    sessionSync,
    UserModel,
    PromisePolly
) {
    if (!window.Promise) {
        window.Promise = PromisePolly;
    }

    var SessionModel = Backbone.Model.extend({   	
        defaults: {
            login: '',
            password: '',
            remember: false
        },

        url: '/api/session',

        sync: sessionSync,
        
        USER_STORAGE_KEY: 'user',

        id: '1',    // for DELETE

        toJSON: function() {
            return JSON.stringify(
                _.clone(this.attributes)
            );
        },

        initialize: function() {
        	this._user = new UserModel();

            var session = this,
                localUser = JSON.parse(localStorage.getItem(this.USER_STORAGE_KEY));

            this._user.set(localUser);

            this.fetch();
        },

        isSigned: function() {
            return this._user.get('id') ? true : false;
        },

        clearUser: function() {
            this._user.clear().set(this._user.defaults);
            localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(this._user));
        },

        setUser: function(userData) {
            this._user.set(userData);
            localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(this._user));
        },

        setPlayer: function(playerData) {
            this._user.set({'player': playerData});
        },

        getUser: function() {
        	return this._user;
        },

        getUserData: function(id) {
            return new Promise(function(resolve, reject) {
                $.ajax({ 
                    url: "/api/user/" + id,
                    
                    type: "GET",
                    
                    contentType: "application/json",

                    success: function(userData) {                      
                        console.log("...USER DATA SUCCESS!");
                        console.log(userData);

                        resolve(userData);
                    },

                    error: function(xhr, error_msg, error) {
                        var error = new Error(error_msg);
                        error.code = xhr.status;

                        console.log("...USER DATA ERROR!\n" + error.code + " " + error.message);

                        reject(error);                        
                    }
                }); // ajax
            }); // Promise
        }   // getUserData
    }); // SessionModel

    return new SessionModel();
});
