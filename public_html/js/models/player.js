define([
	'backbone',
    'three',
    '../game/models/spacecraft',
    '../game/models/shot'
], function(
	Backbone,
    THREE,
    Spacecraft,
    Shot
) {    

    var PlayerModel = Backbone.Model.extend({
    	defaults: {
    		id: 0,
    		score: 0,
    		health: 100,
            
            posX: 0,
            posY: 0,
            posZ: 0,
            
            rotX: 0,
            rotY: 0,
            rotZ: 0
    	},

        url: '/api/game',

        initialize: function() {
            this._spacecraft = new Spacecraft(this.get('posX'), this.get('posY'), this.get('posZ'));
        },

        getMesh: function() {
            return this._spacecraft.getMesh();
        },

        toJSON: function() {
            return JSON.stringify(
                _.clone(this.attributes)
            );
        },

        update: function(camPosition, camRotation) {
            var player = this;
            
            player.set({
                posX: camPosition.x,
                posY: camPosition.y,
                posZ: camPosition.z,

                rotX: camRotation.x,
                rotY: camRotation.y,
                rotZ: camRotation.z
            });

            player._spacecraft.updateHitbox();
        },

        getPositionWorld: function() {
            return this.getMesh().matrixWorld;
        }
        /*
        createShot: function(camera, event) {
            var projector = new THREE.Projector(),
                shot = new Shot(new THREE.Vector3(this.get('x'), this.get('y'), this.get('z')));

            var vector = new t.Vector3(mouse.x, mouse.y, 1);
            projector.unprojectVector(vector, );
            sphere.ray = new t.Ray(
                obj.position,
                vector.subSelf(obj.position).normalize()
            );
        }*/
    });
    
    return PlayerModel;
});
