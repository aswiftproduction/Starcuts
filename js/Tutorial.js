/**
 * Created by Larry on 5/9/2017.
 */
var starCuts = starCuts || {};

starCuts.Tutorial = function(){};

var index = 1;

starCuts.Tutorial.prototype =
    {
        create: function () {
            this.trans(index);
        },

        previous: function(){
            if (index == 1)
                starCuts.game.state.start('MainMenu');
            else {
                index--;
                this.trans(index);
            }
        },

        following: function(){
            if (index == 3) {

                index = 1;
                starCuts.game.state.start('MainMenu');
            }
            else {
                index++;
                this.trans(index);
            }
        },

        trans: function(x){
            if(x == 1)
                this.game.add.sprite(0,0,'tut1');
            else if(x == 2)
                this.game.add.sprite(0,0,'tut2');
            else if(x == 3)
                this.game.add.sprite(0,0,'tut3');

            this.back = this.game.add.sprite(25,580, 'previous');
            this.next = this.game.add.sprite(1050,580, 'next');

            this.back.alpha = 0.5;
            this.back.inputEnabled = true;
            this.back.events.onInputOver.add(function () {
                this.alpha = 1;
            }, this.back);
            this.back.events.onInputOut.add(function () {
                this.alpha = 0.5;
            }, this.back);
            this.back.events.onInputDown.add(this.previous, this);

            this.next.alpha = 0.5;
            this.next.inputEnabled = true;
            this.next.events.onInputOver.add(function () {
                this.alpha = 1;
            }, this.next);
            this. next.events.onInputOut.add(function () {
                this.alpha = 0.5;
            }, this.next);
            this.next.events.onInputDown.add(this.following, this);
        }
    };

