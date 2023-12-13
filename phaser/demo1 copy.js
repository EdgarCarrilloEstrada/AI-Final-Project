var w=800;
var h=400;
var jugador;
var fondo;

var bala, balaD = false, balaD2 = false, nave;

var salto;
var derecha;
var izquierda;
var menu;

var velocidadBala;
var despBala;
var estatusAire;
var estatuSuelo;

var velocidadBala2;
var despBala2;

var nnNetwork , nnEntrenamiento, nnSalida, nnSalida2, datosEntrenamiento=[], datosEntrenamiento2=[], rows = [];
var modoAuto = false, eCompleto=false;



var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render:render});

function preload() {
    juego.load.image('fondo', 'assets/game/fondo.jpg');
    juego.load.spritesheet('mono', 'assets/sprites/altair.png',32 ,48);
    juego.load.image('nave', 'assets/game/ufo.png');
    juego.load.image('bala', 'assets/sprites/purple_ball.png');
    juego.load.image('menu', 'assets/game/menu.png');
}



function create() {

    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = 800;
    juego.time.desiredFps = 30;

    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo');
    nave = juego.add.sprite(w-100, h-70, 'nave');
    bala = juego.add.sprite(w-100, h, 'bala');
    bala2 = juego.add.sprite(w, h-400, 'bala');
    jugador = juego.add.sprite(50, h, 'mono');


    juego.physics.enable(jugador);
    jugador.body.collideWorldBounds = true;
    var corre = jugador.animations.add('corre',[8,9,10,11]);
    jugador.animations.play('corre', 10, true);

    juego.physics.enable(bala);
    bala.body.collideWorldBounds = true;

    juego.physics.enable(bala2);
    bala2.body.collideWorldBounds = true;

    pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, self);
    juego.input.onDown.add(mPausa, self);

    salto = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    derecha = juego.input.keyboard.addKey(Phaser.Keyboard.D);
    izquierda = juego.input.keyboard.addKey(Phaser.Keyboard.A);

    
    nnNetwork =  new synaptic.Architect.Perceptron(2,3,3,2);
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);

}

function enRedNeural(){
    nnEntrenamiento.train(datosEntrenamiento, {rate: 0.03, iterations: 10000, shuffle: true});
}


function datosDeEntrenamiento(param_entrada){

    console.log("Entrada",param_entrada[0]+" "+param_entrada[1]);
    nnSalida = nnNetwork.activate(param_entrada);
    var aire=Math.round( nnSalida[0]*100 );
    var piso=Math.round( nnSalida[1]*100 );
    console.log("Valor ","En la salida de no saltar %: " + piso + " saltar %: " + aire );
    return nnSalida[0]>=nnSalida[1];
//	return aire>80;
}



function pausa(){
    juego.paused = true;
    menu = juego.add.sprite(w/2,h/2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}

function mPausa(event){
    if(juego.paused){
        var menu_x1 = w/2 - 270/2, menu_x2 = w/2 + 270/2,
            menu_y1 = h/2 - 180/2, menu_y2 = h/2 + 180/2;

        var mouse_x = event.x  ,
            mouse_y = event.y  ;

        if(mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2 ){
            if(mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1 && mouse_y <=menu_y1+90){
                eCompleto=false;
                datosEntrenamiento = [];
                modoAuto = false;
            }else if (mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1+90 && mouse_y <=menu_y2) {
                if(!eCompleto) {
                    console.log("","Entrenamiento "+ datosEntrenamiento.length +" valores" );
                    enRedNeural();
                    eCompleto=true;
                }
                modoAuto = true;
            }

            menu.destroy();
            resetVariables();
            resetVariables2();
            juego.paused = false;

        }
    }
}


function resetVariables() {
    bala.body.velocity.x = 0;
    bala.position.x = w - 100;
    balaD = false;
    if (juego.paused == true) {
        jugador.body.velocity.x=0;
        jugador.body.velocity.y = 0;
        jugador.position.x=50;
        
    }
}

function resetVariables2() {
    bala2.body.velocity.y = 0;
    bala2.position.y = h - 400;
    balaD2 = false;
    if (juego.paused == true) {
        jugador.body.velocity.x=0;
        jugador.body.velocity.y = 0;
        jugador.position.x=50;
    }
    
}


function saltar(){
    jugador.body.velocity.y = -270;
}

function moveForward() {
    jugador.body.velocity.x = +150
}

function moveBackward() {
    jugador.body.velocity.x = -150
}


function update() {

    fondo.tilePosition.x -= 1; 

    juego.physics.arcade.collide(bala, jugador, colisionH, null, this);
    juego.physics.arcade.collide(bala2, jugador, colisionH, null, this);

    estatuSuelo = 1;
    estatusAire = 0;

    if(!jugador.body.onFloor()) {
        estatuSuelo = 0;
        estatusAire = 1;
    }
	
    despBala = Math.floor( jugador.position.x - bala.position.x );
    despBala2 = Math.floor( jugador.position.y - bala2.position.y );

    if( modoAuto==false && salto.isDown && jugador.body.onFloor() ){
        saltar();
    }

    if ( modoAuto==false && derecha.isDown ){
        moveForward();
    }

    if ( modoAuto==false && izquierda.isDown ){
        moveBackward();
    }
    
    if( modoAuto == true  && bala.position.x > 0 && jugador.body.onFloor()) {

        if( datosDeEntrenamiento( [despBala , velocidadBala] )  ){
            saltar();
        }
    }

    if( balaD==false ){
        disparo();
    }
    
    if (balaD2==false) {
        disparo2();
    }

    if( bala.position.x <= 0  ){
        resetVariables();
    }

    if( bala2.position.y >= 383  ){
        resetVariables2();
    }

    
    if( modoAuto ==false && (bala.position.x > 0 && bala.position.x < 240) ){

        datosEntrenamiento.push({
                'input' :  [despBala , velocidadBala],
            'output':  [estatusAire, estatuSuelo ]  
        });

        console.log(despBala, + " " + velocidadBala, + " " + estatusAire, +" " + estatuSuelo);

        // rows.push([despBala, velocidadBala, estatusAire, estatuSuelo]);
        
    }

}


function disparo(){
    velocidadBala = -1 * velocidadRandom(300, 800);
    bala.body.velocity.y = 0 ;
    bala.body.velocity.x = velocidadBala;
    balaD=true;
}

function disparo2() {
    velocidadBala2 = velocidadRandom(200, 400);
    bala2.body.velocity.y = velocidadBala2;
    bala2.body.velocity.x = 0;
    bala2.position.x = jugador.position.x;
    balaD2 = true;
}

function colisionH(){
    pausa();
    // let csvContent = "data:text/csv;charset=utf-8,";

    //     rows.forEach(function(rowArray) {
    //         let row = rowArray.join(",");
    //         csvContent += row + "\r\n";
    //     });

    //     var encodedUri = encodeURI(csvContent);
    //     window.open(encodedUri);
}

function velocidadRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function render(){

}
