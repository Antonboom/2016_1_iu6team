define(function(require) {
    var World = require('./models/world'),
        Sphere = require('./models/sphere'),
        Player = require('../models/player'),
        Shot = require('./models/shot'),
        Spacecraft = require('./models/spacecraft');

    var shots = [];

    var KEY_ONE = 49;

    function isIntersection(boxA, boxB) {
        return boxA.intersectsBox(boxB);
    }

    var Game = function(worldContainer) {
        var game = this;

        game._url = '/api/game';

        game._status = {
            connected: false,
            gaming: false
        };

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

            for (var i = 0; i < shots.length; i++) {
                shots[i].update();

                if (isIntersection(shots[i]._hitbox, game._enemy._spacecraft._hitbox)) {
                    console.log('Попадание');
                    game._world.remove(shots[i].getMesh());
                    shots.splice(i, 1);
                } else if (!isIntersection(shots[i]._hitbox, game._sphere._hitbox)) {
                    console.log('За пределами мира');
                    game._world.remove(shots[i].getMesh());
                    shots.splice(i, 1);
                }
            }    
        };
    }

    Game.prototype.updatePlayers = function() {
        var camPosition = this._world.getCamera().position,
            camRotation = this._world.getCamera().rotation;

        this._player.update(camPosition, camRotation);
    }

    Game.prototype.createConnection = function() {
        var game = this;

        this._socket = new WebSocket('ws://0.0.0.0:8090' + this._url);
        
        game._socket.onopen = function() {
            console.log('Соединение с игровой комнатой установлено.');

            game._status.connected = true;
        };

        this._socket.onclose = function(event) {
            if (event.wasClean) {
                console.log('Соедение с игровой комнатой закрыто чисто.');
            } else {
                console.log('Обрыв соединения.');
            }
            
            console.log('Код: ' + event.code + ', причина: ' + event.reason);
            game._status.connected = false;
            game._status.start = false;
        };

        this._socket.onmessage = function(event) {
            console.log('Получены данные ' + event.data);

            var data = JSON.parse(event.data);

            if (data.start) {
                game._status.gaming = true;
                return;
            } 

            if (game._status.gaming) {
                game._enemyCamera.position.x = data.posX;
                game._enemyCamera.position.y = data.posY;
                game._enemyCamera.position.z = data.posZ;

                game._enemyCamera.rotation.x = data.rotX;
                game._enemyCamera.rotation.y = data.rotY;
                game._enemyCamera.rotation.z = data.rotZ;

                var camPosition = game._enemyCamera.position,
                    camRotation = game._enemyCamera.rotation;

                game._enemy.update(camPosition, camRotation);
            }
        };

        this._socket.onerror = function(error) {
            console.log('Ошибка ' + error.message);
        };
    }

    Game.prototype.sendData = function() {
        var game = this;

        if (game._status.connected) {            
            if (game._status.gaming) {
                console.log('Send player: ' + this._player.toJSON());
                game._socket.send(this._player.toJSON());
            }
        } else {
            game.createConnection();
        }
    }

    Game.prototype.getWorld = function() {
        return this._world;
    }

    Game.prototype.createShot = function(camera, player) {
        var raycaster = new THREE.Raycaster();

        var vector = new THREE.Vector3();
        vector.setFromMatrixPosition(player.getPositionWorld());
        var shot = new Shot(vector);

        raycaster.setFromCamera(vector, camera);

        shot._ray = new THREE.Ray(
            camera.position,
            vector.sub(camera.position).normalize()
        );

        shots.push(shot);
        this._world.add(shot.getMesh());

        var audio = new Audio();
        audio.src = 'sounds/lazer_effect.wav';
        audio.autoplay = true;
    }

    Game.prototype.start = function() {
        var game = this,
            controls = null;

        game._player = new Player({posX: 0, posY: -2, posZ: -20 });
        game._enemy = new Player({posX: 0, posY: -2, posZ: -20 });
        game._sphere = new Sphere(1000);

        Promise.all([
            game._sphere.getMesh(),
            game._player.getMesh(),
            game._enemy.getMesh(),
        ]).then(function(results) {
            results.forEach(function(mesh) {
                game._world.add(mesh);
            });

            game._enemyCamera = new THREE.PerspectiveCamera(
                45,
                game._world.getContainer().width / game._world.getContainer().height,
                1,
                2000
            );
            game._enemyCamera.add(results[2]);
            game._world.add(game._enemyCamera);

            game._world.getCamera().add(results[1]);
            game._controls = new THREE.FlyControls(game._world.getCamera(), game._world.getContainer());


            game._controls.dragToLook = false;
            game._controls.autoForward = false;
            game._controls.movementSpeed =  30;
            game._controls.rollSpeed = 1;

            game._world.start();
            setInterval(game.sendData.bind(game), 60);

            $(document).on('click', function (event) {
                game.createShot(game._world.getCamera(), game._player);               
            })
        }); // PROMISE
    } // Game.start


    return Game;
});
