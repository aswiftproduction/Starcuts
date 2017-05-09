/**
 * Created by Larry on 4/8/2017.
 */
var starCuts = starCuts || {};

starCuts.LevelSelect = function(){};



var numRows;
var numCols;

starCuts.LevelSelect.prototype =
    {

    create: function()
    {
        //create menu background
        this.game.add.sprite(0,0,'level select menu');

        //Create array of cups
        this.createLevelsGUI(3,4, 190, 185);

        //Create back button
        this.back = this.game.add.sprite(30,15,'back');
        this.back.alpha = 0.5;
        this.back.inputEnabled = true;
        this.back.events.onInputOver.add(function () {
            this.alpha = 1;
        }, this.back);
        this.back.events.onInputOut.add(function () {
            this.alpha = 0.5;
        }, this.back);
        this.back.events.onInputDown.add(this.mainMenu);
    },

    createLevelsGUI: function (numRows, numCols, xMargin, yMargin)
    {
        xoffset = 980/numCols;
        yoffset = 540/numRows;

        for (y = 0; y < numRows; y++)
        {
            for(x = 0; x < numCols; x++)
            {
                var level = (x+1) + numCols * y;

                //Create all cup sprites
                this.cup = this.game.add.sprite(xMargin + x * xoffset, yMargin + y * yoffset, 'cups');

                //Create numbering on sprites
                this.levelNum = this.game.add.text(this.cup.x + this.cup.width/2.5 ,this.cup.y + this.cup.height/2, level, { font: "54px MV Boli", fill: "#ffffff", wordWrap: true, align: "center" });
                this.levelNum.anchor.set(0.5);
                this.cup.alpha = 0.15;

                //Hightlight on mouseover
                if (level>0&& level<=5) {
                    this.cup.alpha = 0.5;
                    this.cup.inputEnabled = true;
                    this.cup.events.onInputOver.add(function () {
                        this.alpha = 1;
                    }, this.cup);
                    this.cup.events.onInputOut.add(function () {
                        this.alpha = 0.5;
                    }, this.cup);

                    //Level selection
                    this.cup.events.onInputDown.add(this.startLevel, {level: level});
                }

            }
        }
    },

    startLevel: function()
    {
        starCuts.game.state.start('Game',true,false, this.level);
    },

    mainMenu: function()
    {
        starCuts.game.state.start('MainMenu');
    }




};