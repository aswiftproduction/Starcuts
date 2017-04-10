var starCuts = starCuts || {};
 
starCuts.game = new Phaser.Game(1280, 720, Phaser.AUTO, '');
 
starCuts.game.state.add('Boot', starCuts.Boot);
starCuts.game.state.add('Preload', starCuts.Preload);
starCuts.game.state.add('MainMenu', starCuts.MainMenu);
starCuts.game.state.add('LevelSelect', starCuts.LevelSelect);
starCuts.game.state.add('Game', starCuts.Game);

 
starCuts.game.state.start('Boot');