(function () {

    'use strict';

    var stage = new Facade('stage', 25 * 40, 700),
        staticMap = new Facade('map', 25 * 40, 700),
        gamepad = new Gamepad(),
        size = 0,
        playerBlock = new Facade.Rect({ fillStyle: '#f0f' }),
        playerFogOfWar = new Facade.Circle({ radius: 100, fillStyle: '#fff', anchor: 'center' }),
        activeTorches = [],
        mapBlock = new Facade.Rect({ fillStyle: '#0f0' }),
        torchBlock = new Facade.Rect({ fillStyle: '#0af' }),
        exitBlock = new Facade.Rect({ fillStyle: '#00f' }),
        keyMapping = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' },
        activeKeys = { left: false, down: false, right: false, up: false },
        mapData = null;

    $.get('maps/level1.json', function (data) {

        mapData = data;

        size = data.size;

        [playerBlock, mapBlock, torchBlock, exitBlock].forEach(function (obj) {

            obj.setOptions({ width: size, height: size });

        });

        mapData.walls.map(function (num) {

            staticMap.addToStage(mapBlock, getPositionFromCoordinate(num));

        });

        mapData.torches.forEach(function (num) {

            staticMap.addToStage(torchBlock, getPositionFromCoordinate(num));

        });

        if (mapData.exit.length) {

            staticMap.addToStage(exitBlock, getPositionFromCoordinate(mapData.exit[0]));

        }

        if (mapData.player.length) {

            playerBlock.setOptions(getPositionFromCoordinate(mapData.player[0]));

        }

    });

    function getPositionFromCoordinate (coord) {

        return {
            x: coord % (stage.width() / size) * size,
            y: Math.floor(coord / (stage.width() / size)) * size
        };

    }

    function getCoordinateFromPosition (pos) {

        return pos.x / size + (pos.y / size * (stage.width() / size));

    }

    function displayFogOfWar (pos) {

        stage.context.save();

        stage.addToStage(playerFogOfWar, pos);

        stage.context.clip();

        stage.context.drawImage(staticMap.canvas, 0, 0);

        stage.context.restore();

    }

    stage.draw(function () {

        var self = this,
            currentPlayerOptions = playerBlock.getAllOptions(),
            currentPlayerCoord;

        self.context.save();

        self.clear();

        if (mapData) {

            displayFogOfWar({ x: playerBlock.getOption('x') + 20, y: playerBlock.getOption('y') + 20 });

            activeTorches.forEach(function (torch) {

                var options = getPositionFromCoordinate(torch);

                options.x += size / 2;
                options.y += size / 2;
                options.radius = 150;

                displayFogOfWar(options);

            });

            if (activeKeys.up) {

                playerBlock.setOptions({ y: playerBlock.getOption('y') - size });

                activeKeys.up = false;

            } else if (activeKeys.down) {

                playerBlock.setOptions({ y: playerBlock.getOption('y') + size });

                activeKeys.down = false;

            }

            if (activeKeys.left) {

                playerBlock.setOptions({ x: playerBlock.getOption('x') - size });

                activeKeys.left = false;

            } else if (activeKeys.right) {

                playerBlock.setOptions({ x: playerBlock.getOption('x') + size });

                activeKeys.right = false;

            }

            currentPlayerCoord = getCoordinateFromPosition(playerBlock.getAllOptions());

            if (mapData.exit.indexOf(currentPlayerCoord) !== -1) {

                playerBlock.setOptions(currentPlayerOptions);

                alert('You win!');

            } else if (mapData.walls.indexOf(currentPlayerCoord) !== -1) {

                playerBlock.setOptions(currentPlayerOptions);

            } else if (mapData.torches.indexOf(currentPlayerCoord) !== -1 && activeTorches.indexOf(currentPlayerCoord) === -1) {

                activeTorches.push(currentPlayerCoord);

            }

            self.addToStage(playerBlock);

        }

        self.context.restore();

    });

    document.addEventListener('keydown', function (e) {

        if (Object.keys(keyMapping).indexOf(String(e.keyCode)) !== -1) {

            e.preventDefault();

            activeKeys[keyMapping[e.keyCode]] = true;

        }

    });

    gamepad.on('d_pad_up', { delay: 10 }, function () {

        activeKeys.up = true;

    });

    gamepad.on('d_pad_right', { delay: 10 }, function () {

        activeKeys.right = true;

    });

    gamepad.on('d_pad_down', { delay: 10}, function () {

        activeKeys.down = true;

    });

    gamepad.on('d_pad_left', { delay: 10 }, function () {

        activeKeys.left = true;

    });

    document.body.appendChild(stage.canvas);

}());
