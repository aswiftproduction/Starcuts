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
    this.game.load.image('background', 'assets/background.png');
    this.game.load.image('floor', 'assets/floor.png');
    this.game.load.spritesheet('player', 'assets/player_sprite.png', 80, 112);
    this.game.load.spritesheet('baddie', 'assets/baddie.png', 32,32);
    this.game.load.image('star', 'assets/star.png');
    this.game.load.image('main menu', 'assets/main menu.png');
    this.game.load.image('play game', 'assets/play game.png');
    this.game.load.image('level select', 'assets/level select.png');
    this.game.load.image('level select menu', 'assets/level select menu.png');
    this.game.load.image('cups', 'assets/cups.png');
    this.game.load.image('pinknpc', 'assets/npc_pink.png');
    this.game.load.image('borednpc', 'assets/npc_bored.png');
    this.game.load.image('talking_l', 'assets/npc_talking_l.png');
    this.game.load.image('talking_r', 'assets/npc_talking_r.png');
  },
  create: function() {
    this.state.start('MainMenu');
  }
};