var starCuts = starCuts || {};
 
starCuts.Boot = function(){};
 
//setting game configuration and loading the assets for the loading screen
starCuts.Boot.prototype = {
  preload: function() {
    //assets we'll use in the loading screen
    this.load.image('preloadbar', 'assets/preloader-bar.png');
  },
  create: function() {
    
    //loading screen will have a white background
    this.game.stage.backgroundColor = '#604c4c';
    
    //physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    //have the game centered horizontally
	this.scale.pageAlignHorizontally = true;
	this.scale.pageAlignVertically = true;

    this.state.start('Preload');
    
  }
};