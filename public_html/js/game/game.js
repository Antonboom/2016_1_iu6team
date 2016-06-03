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
            /*
            var relativeCameraOffset = new THREE.Vector3(0, 3, 15);
            var cameraOffset = relativeCameraOffset.applyMatrix4(game._player.getMesh().matrixWorld);
            game._world.getCamera().position.x = cameraOffset.x
            game._world.getCamera().position.y = cameraOffset.y
            game._world.getCamera().position.z = cameraOffset.z
            game._world.getCamera().lookAt(game._player.getMesh().position);*/

            for (var i = 0; i < shots.length; i++) {
                /*if (!shots[i].update(game._world.getCamera().position.z)) {
                    game._world.getScene().remove(shots[i].getMesh());
                    shots.splice(i, 1);
                }*/
                shots[i].getMesh().translateX(10 * shots[i].ray.direction.x);
                shots[i].getMesh().translateY(10 * shots[i].ray.direction.y + 0.7); // Выстрел чуть выше
                shots[i].getMesh().translateZ(10 * shots[i].ray.direction.z);
            }    


            // Стрелка
            /*
            var sourcePos = new THREE.Vector3().setFromMatrixPosition(game._player.getPositionInWorld());
            var targetPos = new THREE.Vector3().setFromMatrixPosition(game._enemy.getPositionInWorld());
            var direction = new THREE.Vector3().sub(targetPos, sourcePos);
            
            game._arrow.position.set(sourcePos);
            game._arrow.setDirection(direction.normalize());
            game._arrow.setLength(direction.length());*/
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
            game._connected = true;
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

//                game._enemy.getMesh().position.x = data.posX;
//                game._enemy.getMesh().position.y = data.posY;
//                game._enemy.getMesh().position.z = data.posZ;
//
//                game._enemy.getMesh().rotation.x = data.rotX;
//                game._enemy.getMesh().rotation.y = data.rotY;
//                game._enemy.getMesh().rotation.z = data.rotZ;

       //         game._enemy.getMesh().rotateY(Math.PI);

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

    Game.prototype.start = function() {
        var game = this,
            controls = null;


        //game._player = new Player({posX: 0, posY: -2, posZ: -20 });
        game._player = new Player({posX: 0, posY: -2, posZ: -20 });
        game._enemy = new Player({posX: 0, posY: -2, posZ: -20 });


        // Players
        Promise.all([
            new Sphere(1000).getMesh(),
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

            var sourcePos = new THREE.Vector3(0, 10, 0);
            var targetPos = new THREE.Vector3().setFromMatrixPosition(game._enemy.getPositionInWorld());
            var direction = new THREE.Vector3().sub(targetPos, sourcePos);

            game._arrow = new THREE.ArrowHelper(direction.clone().normalize(), sourcePos, 1, 0x00ff00);  
             game._world.getCamera().add(game._arrow);
            game._world.add(game._arrow);

            game._world.start();
            setInterval(game.sendData.bind(game), 60);



            $(document).on('click', function (event) {
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
                raycaster.setFromCamera(vector, camera);

                shot.ray = new THREE.Ray(
                    camera.position,
                    vector.sub(camera.position).normalize()
                );

                shots.push(shot);
                game._world.add(shot.getMesh());

                var intersects = raycaster.intersectObjects(game._world.getScene().children);

                var target, color;
                for (var i = 0; i < intersects.length; i++ ) {
                    target = intersects[i];
                    // console.log(target);
                    if (!(target.name !== 'SPHERE')) {
                        color = target.object.material.color;
                        target.object.material.color.set(0xff0000);
                        setTimeout(function() {
                            target.object.material.color.set(color);
                        }, 1000);
                    }
                }
            })
        }); // PROMISE
    } // Game.start


    return Game;
});
