define(function(require) {
    var THREE = require('three');
    require('flycontrols');
    
    var World = function(options) { 
        /* options: container, camDistance, ambientLightColor, clearColor, renderCallBackm, rendererOpts */

        this._camera = {};
        this._scene = {};
        this._renderer = {};
        this._frameCallback = {};
        this._paused = false;
        
        if (!options) {
            options = {};
        }

        var width  = options.container ? options.container.clientWidth  : window.innerWidth,
            height = options.container ? options.container.clientHeight : window.innerHeight;

        // Camera
        this._camera = new THREE.PerspectiveCamera(45, width / height, 1, options.farPlane || 2000);
        this._camera.position.z = options.camDistance || 500;
        
        this._frameCallback = options.renderCallback;

        // Scene
        this._scene = new THREE.Scene();
        this._scene.add(this._camera);
        this._camera.lookAt(this._scene.position);

        var ambColor = options.ambientLightColor === undefined ? 0xffffff : options.ambientLightColor,
            ambient = new THREE.AmbientLight(ambColor);
        this._scene.add(ambient);

        this._renderer = new THREE.WebGLRenderer(options.rendererOpts);
        this._renderer.setSize(width, height);
        
        if (options.clearColor) {
            this._renderer.setClearColor(options.clearColor);
        }

        // Container
        this._container = options.container || document.body;
        this._container.appendChild(this._renderer.domElement);

        window.addEventListener('resize', updateSize.bind(this), false);

        function updateSize() {
            var width  = this._container ? this._container.clientWidth  : window.innerWidth,
                height = this._container ? this._container.clientHeight : window.innerHeight;

            this._camera.aspect = width / height;
            this._camera.updateProjectionMatrix();

            this._renderer.setSize(width, height);
        }
    }

    World.prototype.render = function() {
        if (this._paused) {
            return;
        }

        if (this._frameCallback && (this._frameCallback() === false)) {
            window.requestAnimationFrame(this.render.bind(this));
            return;
        }

        this._renderer.render(this._scene, this._camera);

        window.requestAnimationFrame(this.render.bind(this));
    }

    World.prototype.add = function(object) {
        this._scene.add(object);
    }

    World.prototype.remove = function(object) {
        this._scene.remove(object);
    }

    World.prototype.start = function() {
        this.render();
    }

    World.prototype.pause = function() {
        this._paused = true;
    }

    World.prototype.resume = function() {
        this._paused = false;
        this.render();
    }

    World.prototype.isPaused = function() {
        return this._paused;
    }

    World.prototype.getCamera = function() { return this._camera; };
    World.prototype.getRenderer = function() { return this._renderer; };
    World.prototype.getScene = function() { return this._scene; };
    World.prototype.getContainer = function() { return this._container; };

    return World;
}); // define()
