define(function(require) {
	var THREE = require('three');

	var Shot = function(position) {
		this._mesh = new THREE.Mesh(
	   		new THREE.SphereGeometry(2, 6, 4),
	   		new THREE.MeshBasicMaterial({
				color: 0xff0000,
				transparent: true,
				opacity: 0.5
			})
		);

		this._mesh.scale.x = this._mesh.scale.y = this._mesh.scale.z = 2;
		this._mesh.position.copy(position);
	}

	Shot.prototype.getMesh = function() {
		return this._mesh;
	}

	Shot.prototype.update = function(z) {
		this._mesh.translateZ(-10);
		//this._mesh.position.z -= 10;	

	   	if(Math.abs(this._mesh.position.z - z) > 1000) {
	     	delete this._mesh;	
	     	return false;
	   	}

	   	return true;
	}

	return Shot;
});