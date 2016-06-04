define([
    'backbone',
    './sync/sessionSync',
    './user'
], function (
    Backbone,
    sessionSync,
    UserModel
) {
    var SessionModel = Backbone.Model.extend({   	
        defaults: {
            login: '',
            password: '',
            remember: false
        },

        url: '/api/session',

        sync: sessionSync,
        
        id: '1',    // for DELETE

        user: new UserModel(),

        initialize: function() {
        	var session = this;
            
            this.listenTo(
                this.user, 
                'status:received',
                function() { session.trigger('status:received'); }
            );     

            // this.fetch();     
        },

        toJSON: function() {
            return JSON.stringify(
                _.clone(this.attributes)
            );
        },

        isSigned: function() {
            return !!this.user.get('id');
        },

        clearUser: function() {
            this.user.clear().set(this.user.defaults);
        },

        setPlayer: function(playerData) {
            this.user.set({'player': playerData});
        },

        getUser: function() {
        	return this.user;
        }
    }); // SessionModel

    return new SessionModel();
});
