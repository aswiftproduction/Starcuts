/**
 * Created by Larry on 4/6/2017.
 */
var starCuts = starCuts || {};

starCuts.MainMenu = function(){};

starCuts.MainMenu.prototype = {

    create: function (){
        //creates menu background
        this.menu = this.game.add.sprite(0,0,'main menu');

        //create play game button and set events
        this.playGame = this.game.add.sprite(171,243,'play game');
        this.playGame.inputEnabled = true;
        this.playGame.anchor.setTo(0.5,0.5);
        this.playGame.events.onInputDown.add(this.startGame);

        //Create level select button and set events
        this.levelSelect = this.game.add.sprite(205,323,'level select');
        this.levelSelect.inputEnabled = true;
        this.levelSelect.anchor.setTo(0.5,0.5);
        this.levelSelect.events.onInputDown.add(this.startLevelSelect);

        this.howtoplay = this.game.add.sprite(205,403,'tutorial');
        this.howtoplay.inputEnabled = true;
        this.howtoplay.anchor.setTo(0.5,0.5);
        this.howtoplay.events.onInputDown.add(this.startTutorial);
    },

    update: function () {

        //Scales on mouseover
        if (this.playGame.input.pointerOver()){
            this.playGame.scale.setTo(1,1);
        }else{
            this.playGame.scale.setTo(0.9,0.9);
        }

        if (this.levelSelect.input.pointerOver()){
            this.levelSelect.scale.setTo(1,1);
        }else{
            this.levelSelect.scale.setTo(0.9,0.9);
        }

        if (this.howtoplay.input.pointerOver()){
            this.howtoplay.scale.setTo(1,1);
        }else{
            this.howtoplay.scale.setTo(0.9,0.9);
        }


    },

    startGame: function () {
        starCuts.game.state.start('Game',true,false,1);
    },

    startLevelSelect: function(){
        starCuts.game.state.start('LevelSelect');
    },

    startTutorial: function(){
        starCuts.game.state.start('Tutorial');
    }

};