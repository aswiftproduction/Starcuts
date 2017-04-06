var TopDownGame = TopDownGame || {};
 
TopDownGame.Boot = function(){};
 
//setting game configuration and loading the assets for the loading screen
TopDownGame.Boot.prototype = {
  preload: function() {
    //assets we'll use in the loading screen
    this.load.image('preloadbar', 'assets/preloader-bar.png');
  },
  create: function() {
    
    //loading screen will have a white background
    this.game.stage.backgroundColor = '#fff';
    
    //physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    
    this.state.start('Preload');
    
  }
};