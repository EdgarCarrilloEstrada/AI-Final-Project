// Dimensiones del lienzo
var w = 800;
var h = 400;

// Variables para el jugador y el fondo
var jugador;
var fondo;

// Variables relacionadas con las balas y la nave
var bala, balaD = false, nave;
var bala2;
var bala2D = false;

// Variable para el salto
var salto;

// Variable para el menú
var menu;

// Variable para el sonido
var sonido;

// Variables de velocidad y desplazamiento de la bala
var velocidadBala;
var despBala;
var despBala2;
var estatusAire;
var estatuSuelo;

// Variables de control horizontal
var botones;
var estatusLeft;
var estatusRight;

// CSV - Estructura de datos para almacenar información
var rows = [
    [
        "despBala",
        "velocidadBala",
        "despBala2",
        "estatusAire",
        "estatusLeft",
        "estatusRigth",
    ],
];

// Red neuronal y entrenamiento
var nnNetwork, nnEntrenamiento, nnSalida, nnSalida2, datosEntrenamiento = [];
var modoAuto = false;  // Modo automático
var eCompleto = false;  // Entrenamiento completo

// Crear un juego Phaser
var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });

// Función de precarga de recursos
function preload() {
    juego.load.image('fondo', 'assets/game/fondo.jpg');
    juego.load.spritesheet('mono', 'assets/sprites/altair.png', 32, 48);
    juego.load.image('nave', 'assets/game/ufo.png');
    juego.load.image('bala', 'assets/sprites/purple_ball.png');
    juego.load.image('menu', 'assets/game/menu.png');
    juego.load.audio('jumpSound', 'assets/audio/jump.mp3');
}

// Función de inicialización
function create() {
    // Configuración del sistema de física de ARCADE
    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = 800;
    juego.time.desiredFps = 120;

    // Creación de elementos del juego
    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo');
    nave = juego.add.sprite(w - 100, h - 70, 'nave');
    bala = juego.add.sprite(w - 100, h, 'bala');
    bala2 = juego.add.sprite(w - 750, h - 400, 'bala');
    jugador = juego.add.sprite(50, h, 'mono');

    // Habilitar la física para el jugador
    juego.physics.enable(jugador);
    jugador.body.collideWorldBounds = true;
    var corre = jugador.animations.add('corre', [8, 9, 10, 11]);
    jugador.animations.play('corre', 10, true);

    // Habilitar la física para las balas
    juego.physics.enable(bala);
    bala.body.collideWorldBounds = true;

    juego.physics.enable(bala2);
    bala2.body.collideWorldBounds = true;

    // Crear un texto para la pausa
    pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, self);
    juego.input.onDown.add(mPausa, self);

    // Configuración de las teclas de control
    salto = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    sonido = juego.sound.add('jumpSound');

    botones = juego.input.keyboard.createCursorKeys();

    // Configuración de la red neuronal y entrenamiento
    nnNetwork = new synaptic.Architect.Perceptron(3, 10, 3, 3);
    // Capa de entrada para la distancia de la bala horizontal, velocidad de bala horizontal, y distancia de la bala vertical
    // Segunda y tercera capa para aprendizaje y ajuste
    // Capa de salida para decidir si saltar, moverse a la derecha o a la izquierda
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);
}


// Función de entrenamiento de la red neuronal
function enRedNeural() {
    nnEntrenamiento.train(datosEntrenamiento, { log: 1000, rate: 0.0003, iterations: 10000, shuffle: true });
}

// Función para obtener datos de entrenamiento
function datosDeEntrenamiento(param_entrada) {
    console.log(
        "Entrada",
        param_entrada[0] + " " + param_entrada[1] + " " + param_entrada[2]
    );
    nnSalida = nnNetwork.activate(param_entrada);
    console.log("NNSALIDA");
    console.log(nnSalida);
    return [nnSalida[0] > 0.5 ? 1 : 0, nnSalida[1], nnSalida[2]];
}

// Función para pausar el juego
function pausa() {
    restartGame();
    juego.paused = true;
    menu = juego.add.sprite(w / 2, h / 2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}

// Función para manejar la pausa con el mouse
function mPausa(event) {
    if (juego.paused) {
        var menu_x1 = w / 2 - 270 / 2, menu_x2 = w / 2 + 270 / 2,
            menu_y1 = h / 2 - 180 / 2, menu_y2 = h / 2 + 180 / 2;

        var mouse_x = event.x,
            mouse_y = event.y;

        if (mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2) {
            if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 && mouse_y <= menu_y1 + 90) {
                eCompleto = false;
                datosEntrenamiento = [];
                modoAuto = false;
            } else if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 + 90 && mouse_y <= menu_y2) {
                if (!eCompleto) {
                    console.log("", "Entrenamiento con: " + datosEntrenamiento.length + " valores");
                    enRedNeural();
                    eCompleto = true;
                }
                modoAuto = true;
            }

            menu.destroy();
            resetVariables();
            juego.paused = false;
        }
    }
}

// Función para reiniciar variables del juego
function resetVariables() {
    jugador.body.velocity.x = 0;
    jugador.body.velocity.y = 0;

    bala.body.velocity.x = 0;
    bala.position.x = w - 100;
    balaD = false;
}

// Función para reiniciar la bala2
function resetBala2() {
    bala2.body.velocity.x = 0;
    bala2.position.x = jugador.body.position.x;
    bala2.position.y = 0;
    bala2D = false;
}

// Función para reiniciar el juego
function restartGame() {
    jugador.body.position.x = 50;
    jugador.body.position.y = h;
    jugador.body.velocity.x = 0;
    jugador.body.velocity.y = 0;

    bala.body.velocity.x = 0;
    bala.position.x = w - 100;
    balaD = false;

    bala2.body.velocity.x = 0;
    bala2.position.x = jugador.body.position.x;
    bala2.position.y = 0;
    bala2D = false;
}

// Función para realizar un salto
function saltar() {
    sonido.play();
    jugador.body.velocity.y = -270;
}

// Función para mover hacia la derecha
function moveRight() {
    jugador.body.velocity.x = 150;
    estatusLeft = 0;
    estatusRight = 1;
}

// Función para mover hacia la izquierda
function moveLeft() {
    jugador.body.velocity.x = -150;
    estatusLeft = 1;
    estatusRight = 0;
}

// Función para manejar el juego en modo manual
function juegoManual() {
    jugador.body.velocity.x = 0;
    estatusLeft = 0;
    estatusRight = 0;
    if (salto.isDown && jugador.body.onFloor()) {
        saltar();
    }

    if (botones.right.isDown) {
        moveRight();
    }

    if (botones.left.isDown) {
        moveLeft();
    }
}


// Función para que la IA juegue automáticamente
function juegaIA() {
    if (bala.position.x > 0) {
        jugador.body.velocity.x = 0;
        estatusLeft = 0;
        estatusRight = 0;
        var data = datosDeEntrenamiento([despBala, velocidadBala, despBala2]);
        console.log("DATA: ");
        console.log(data);
        if (data[0]) {
            if (jugador.body.onFloor()) {
                saltar();
            }
        }
        if (data[1] > data[2]) {
            moveLeft();
            estatusLeft = 1;
            estatusRight = 0;
        }
        if (data[2] > data[1]) {
            moveRight();
            estatusLeft = 0;
            estatusRight = 1;
        }
    }
}

// Función de actualización del juego
function update() {
    fondo.tilePosition.x -= 1;

    juego.physics.arcade.collide(bala, jugador, colisionH, null, this);
    // Falta entender
    juego.physics.arcade.collide(bala2, jugador, colisionH, null, this);

    estatuSuelo = 1;
    estatusAire = 0;

    if (!jugador.body.onFloor()) {
        estatuSuelo = 0;
        estatusAire = 1;
    }

    despBala = Math.floor(jugador.position.x - bala.position.x);
    despBala2 = Math.floor(jugador.position.x - bala2.position.x);

    if (modoAuto == false) {
        juegoManual();
    } else {
        juegaIA();
    }

    if (balaD == false) {
        disparo();
    }

    if (bala.position.x <= 0) {
        resetVariables();
    }

    if (bala2.position.y >= 383) {
        resetBala2();
    }

    // Entender
    if (modoAuto == false && bala.position.x > 0) {
        rows.push([
            despBala,
            velocidadBala,
            despBala2,
            estatusAire,
            estatusLeft,
            estatusRight,
        ]);
        datosEntrenamiento.push({
            input: [despBala, velocidadBala, despBala2],
            output: [estatusAire, estatusLeft, estatusRight],
        });
        console.log(
            `Bala 1: ${despBala}, Bala 1 Velocidad: ${velocidadBala}, Bala 2: ${despBala2}, Estatus Aire: ${estatusAire}, Estatus Izquierda: ${estatusLeft}, Estatus Derecha: ${estatusRight}`
        );
    }
}


// Función para disparar la bala
function disparo() {
    velocidadBala = -1 * velocidadRandom(300, 500);
    bala.body.velocity.y = 0;
    bala.body.velocity.x = velocidadBala;
    balaD = true;
}

// Función para manejar la colisión horizontal
function colisionH() {
    pausa();

    // Crear contenido CSV para la descarga
    var csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.join(",")).join("\n");
    var encodedUri = encodeURI(csvContent);
    // window.open(encodedUri);
}

// Función para generar una velocidad aleatoria dentro de un rango
function velocidadRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Función de renderizado (puede mantenerse vacía si no se utiliza)
function render() {

}