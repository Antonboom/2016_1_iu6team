define(function(require) {
    var World = require('./models/world'),
        Sphere = require('./models/sphere'),
        Player = require('../models/player'),
        Shot = require('./models/shot'),
        Spacecraft = require('./models/spacecraft');

    var shots = [];

    var KEY_ONE = 49;

    var Game = function(worldContainer) {
        var game = this;

        game._url = '/api/game', 

        game._world = new World({
            renderCallback: render,
            clearColor: 0x000022,
            container: worldContainer
        });
        
        game._clock = new THREE.Clock();

        // Sphere
        game._world.getScene().fog = new THREE.FogExp2(0x0000022, 0.00125);        

        // Render
        function render() {
            var delta = game._clock.getDelta();
            game._controls.update(delta);
            game.updatePlayers();
            //game.sendData();
            
            for (var i = 0; i < shots.length; i++) {
                /*if (!shots[i].update(game._world.getCamera().position.z)) {
                    game._world.getScene().remove(shots[i].getMesh());
                    shots.splice(i, 1);
                }*/
                shots[i].getMesh().translateX(10 * shots[i].ray.direction.x);
                shots[i].getMesh().translateX(10 * shots[i].ray.direction.y);
                shots[i].getMesh().translateZ(-10 * shots[i].ray.direction.z);
            }    
        }
    }

    Game.prototype.updatePlayers = function() {
        this._player.update(this._world.getCamera().position);
        //this._enemy.update();
    }

    Game.prototype.createConnection = function() {
        this._socket = new WebSocket('ws://localhost:8090' + this._url);
        
        this._socket.onclose = function(event) {
            if (event.wasClean) {
                console.log('Соедение с игровой комнатой закрыто чисто.');
            } else {
                console.log('Обрыв соединения.');
            }
            
            console.log('Код: ' + event.code + ', причина: ' + event.reason);
            this._connected = false;
        };

        this._socket.onmessage = function(event) {
            console.log('Получены данные ' + event.data);
        };

        this._socket.onerror = function(error) {
            console.log('Ошибка ' + error.message);
        };
    }

    Game.prototype.sendData = function() {
        var game = this;

        if (!this._connected) {
            this._socket.onopen = function() {
                game._connected = true;
                console.log('Соединение с игровой комнатой установлено.');

                console.log('Send player: ' + game._player.toJSON());
                game._socket.send(game._player.toJSON());

                this._connected = true;
            };
        } else {
            console.log('Send player: ' + this._player.toJSON());
            this._socket.send(this._player.toJSON());
        }
    }

    Game.prototype.getWorld = function() {
        return this._world;
    }

    Game.prototype.start = function() {
        var game = this,
            controls = null;

        game._player = new Player({x: 0, y: -2, z: -20 });
        game._enemy = new Player({x: 0, y: 10, z: -30 });

        // Players
        Promise.all([
            new Sphere(1000).getMesh(),
            game._player.getMesh(),
            game._enemy.getMesh(),
        ]).then(function(results) {
            results.forEach(function(mesh) {
                game._world.add(mesh);
            });

            game._world.getCamera().add(results[1]);
            game._controls = new THREE.FlyControls(game._world.getCamera(), game._world.getContainer());

            // game._controls.dragToLook = true;
            game._controls.autoForward = true;
            game._controls.movementSpeed =  5;
            game._controls.rollSpeed = Math.PI / 10;

            game.createConnection();
            game._world.start();

            //window.addEventListener('keyup', function(e) {
            //    switch(e.keyCode) {
            //        case KEY_ONE: {  // Клавиша "1"
            $(document).on('click', function (event) {
                /*var raycaster = new THREE.Raycaster();
                //    vector = new THREE.Vector3();

                var spacecraft = game._player.getMesh(),
                    camera = game._world.getCamera();

                var vector = new THREE.Vector3();
                vector.setFromMatrixPosition(game._player.getPositionInWorld());

                var shot = new Shot(vector);
                //shot.getMesh().rotation.set(camera.rotation);
                
                vector.set(0, 0, 0);
                raycaster.setFromCamera(
                    new THREE.Vector2((event.clientX / window.innerWidth ) * 2 - 1, (event.clientY / window.innerHeight ) * 2 + 1),
                    game._world.getCamera()
                );

                var intersects = raycaster.intersectObjects(game._world.getScene().children);
                
 

                shots.push(shot);
                game._world.add(shot.getMesh());
            //        } break;*/
                var spacecraft = game._player.getMesh(),
                    camera = game._world.getCamera(),
                    raycaster = new THREE.Raycaster();

                var vector = new THREE.Vector3();
                vector.setFromMatrixPosition(game._player.getPositionInWorld());
                var shot = new Shot(vector);

                var mouse = new THREE.Vector3(
                    (event.clientX / window.innerWidth ) * 2 - 1, 
                    (event.clientY / window.innerHeight ) * 2 + 1,
                    1
                );
                raycaster.setFromCamera(mouse, camera );

                shot.ray = new THREE.Ray(
                    camera.position,
                    vector.normalize()
                );

                shots.push(shot);
                game._world.add(shot.getMesh());

                var intersects = raycaster.intersectObjects(game._world.getScene().children);
            })
                

            //    }
            });
    } 


    return Game;
});
