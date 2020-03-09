var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1000,
    height: 800,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image('ship1', 'data/art/ship1.png');
    this.load.image('ship2', 'data/art/ship2.png');
    this.load.image('ship3', 'data/art/ship3.png');
    this.load.spritesheet('tilesheet', 'data/art/tilesheet.png', { frameWidth: 32, frameHeight: 32 });

    this.load.crossOrigin = "anonymous";
    //this.load.setBaseURL("75.164.45.216");
}

function create() {
    this.socket = io();
    this.otherPlayers = this.physics.add.group();

    var button = this.add.image(50, 50, 'ship1').setOrigin(0.5, 0.5).setDisplaySize(53, 40).setInteractive();
    button.on('pointerup', ()=>{window['game']['canvas'][game.device.fullscreen.request]();});
}

function update() {

}
