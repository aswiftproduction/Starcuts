var starCuts = starCuts || {};
 
//loading the game assets
starCuts.Preload = function(){};
 
starCuts.Preload.prototype = {
  preload: function() {
    //show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);
    this.load.setPreloadSprite(this.preloadBar);
 
    //load game assets
    this.game.load.image('sky', 'assets/sky.png');
    this.game.load.image('ground', 'assets/platform.png');
    this.game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    this.game.load.spritesheet('baddie', 'assets/baddie.png', 32,32);
    this.game.load.image('star', 'assets/star.png');
    this.game.load.image('main menu', 'assets/main menu.png');
    this.game.load.image('play game', 'assets/play game.png');
    this.game.load.image('level select', 'assets/level select.png');
    this.game.load.image('level select menu', 'assets/level select menu.png');
    this.game.load.image('cups', 'assets/cups.png');
  },
  create: function() {
    this.state.start('MainMenu');
  }
};