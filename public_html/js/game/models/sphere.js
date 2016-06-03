define(function(require) {
	var THREE = require('three'),
        loadingManager = require('./loadmanager');

        new THREE.TextureLoader();

    var Sphere = function(radius) {
        this._radius = radius;
        this._mesh = null;
    }

    Sphere.prototype.getMesh = function() {
        var loader = new THREE.TextureLoader(loadingManager),
            sphere = this;

        return new Promise(function(resolve, reject) {
            if (sphere._mesh) {
                resolve(sphere._mesh);
            }

            loader.load(
                'js/game/textures/space.jpg',
                function(texture) {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(5, 10);
                    texture.needsUpdate = true;

                    var mesh = new THREE.Mesh(
                        new THREE.SphereGeometry(sphere._radius, 32, 32),
                        new THREE.MeshBasicMaterial({
                            map: texture,
                            side: THREE.BackSide
                        }) 
                    );

                    mesh.name = 'SPHERE';
                    sphere._mesh = mesh;
                    resolve(mesh);
                }
            );  
        }); // Promise
    }   // getMesh
                
    return Sphere;
});