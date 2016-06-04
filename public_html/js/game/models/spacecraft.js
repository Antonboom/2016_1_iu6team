define(function(require) {
	var THREE = require('three'),
        loadingManager = require('./loadmanager');

    var Spacecraft = function(x, y, z) {
        this._startX = x;
        this._startY = y;
        this._startZ = z;

        this._hitbox = new THREE.Box3();
        this._mesh = null; 
    }
    
    Spacecraft.prototype.getMesh = function() {
        var loader = new THREE.JSONLoader(loadingManager),
            spacecraft = this;
        
        // TODO: в промис
        if (spacecraft._mesh !== null) {
            return spacecraft._mesh;
        }

        return new Promise(function(resolve, reject) {
            loader.load(
                'js/game/3D_models/spacecraft.json',   // ../ not working
                function(geometry, materials) {
                    var mesh = new THREE.Mesh(
                        geometry, 
                        new THREE.MeshFaceMaterial(materials)
                    );

                    mesh.position.set(spacecraft._startX, spacecraft._startY, spacecraft._startZ);
                    mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.5;
                    mesh.rotateY(Math.PI); 
                    mesh.tranlation = geometry.center();
                    mesh.receiveShadow = true;
                    
                    spacecraft._mesh = mesh;
                    spacecraft._hitbox.setFromObject(mesh);

                    resolve(mesh);
                }
            );
        }); // Promise
    }   // loadMesh

    Spacecraft.prototype.updateHitbox = function() {
        this._hitbox.setFromObject(this._mesh);
    }

    return Spacecraft;
});
