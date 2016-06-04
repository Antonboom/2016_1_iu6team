define(function(require) {
	var THREE = require('three');

	var Shot = function(position, radius = 3) {
		this._mesh = new THREE.Mesh(
	   		new THREE.SphereGeometry(radius, 6, 4),
	   		new THREE.MeshBasicMaterial({
				color: 0xff0000,
				transparent: true,
				opacity: 0.5
			})
		);

		this._mesh.position.copy(position);

		this._hitbox = new THREE.Box3();
		this._hitbox.setFromObject(this._mesh);
	}

	Shot.prototype.getMesh = function() {
		return this._mesh;
	}

	Shot.prototype.update = function(z) {
		this._mesh.translateX(10 * this._ray.direction.x);
		this._mesh.translateY(10 * this._ray.direction.y + 0.7); // Выстрел чуть выше
		this._mesh.translateZ(10 * this._ray.direction.z);

		this._hitbox.setFromObject(this._mesh);
	}

	return Shot;
});