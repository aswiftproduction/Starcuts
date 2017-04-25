var starCuts = starCuts || {};
//title screen
starCuts.Game = function () {
};

var hasJumped = false;
var gameOver=false;
var gameWon=false;
var startWinX=1000;
var endWinX = 1113;
var lineDrawer;

var sampleArray = ['pinknpc', 'blank', 'pinknpc', 'blank', 'phoneguy'];

starCuts.Game.prototype = {

    init: function(currentLevel){
        //initiaites state with a specified level
        this.currentLevel = currentLevel;
    },


    create: function () {
        this.background = this.game.add.sprite(0, 0, 'background');

        lineDrawer = this.game.add.graphics(0,0);
        lineDrawer.beginFill(0x21922C);
        lineDrawer.lineStyle(7,0x21922C,0);

        //Initialize and load LineGroup
        this.lineGroup = this.game.add.group();
		this.lineGroup.enableBody = true;


		//renders sprites in the lineGroup
        this.generateLevelArray(sampleArray, 400, 125);

        this.generateLineObjectAnimation(this.lineGroup);
		
		
        //  The platforms group contains the ground and the 2 ledges we can jump on
        this.platforms = this.game.add.group();
        //  We will enable physics for any object that is created in this group
        this.platforms.enableBody = true;

        // Here we create the ground.
        this.floor = this.platforms.create(0, this.game.world.height - 64, 'floor');
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        this.floor.scale.setTo(4, 4);
        //  This stops it from falling away when you jump on it
        this.floor.body.immovable = true;

        // The player and its settings
        this.player = this.game.add.sprite(64, this.game.world.height - 125, 'player');


        //  We need to enable physics on the player
        this.game.physics.arcade.enable(this.player);
        this.player.body.setSize(44,97, 20,13);

        //set anchor of player
        this.player.anchor.setTo(0.5, 0.5);

        //  Player physics properties. Give the little guy a slight bounce.
        this.player.body.bounce.y = 0.1;
        this.player.body.gravity.y = 1300;
        this.player.body.collideWorldBounds = true;
        //this.player.scale.setTo(2, 2);

        //  Our two animations, walking left and right.
        //TODO consider jumping/landing animations
        this.player.animations.add('crouch', [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25], 24, false);
        this.player.animations.add('fly', [26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,45,46,47,48,49], 24, true);

        //resizes the game world to match the layer dimensions
        //this.backgroundlayer.resizeWorld();

        //move player with cursor keys
        this.cursors = this.game.input.keyboard.createCursorKeys();

        //working on new jump
        this.player.inputEnabled = true;
        this.player.input.enableDrag();
        //prevent player from actually moving
        this.player.input.setDragLock(false, false);
        this.player.events.onDragStop.add(this.onDragStop, this);
        this.player.events.onDragUpdate.add(this.onDragUpdate,this);
		this.player.events.onDragStart.add(this.onDragStart,this);
		//this.player.frame = 1;
    },
    update: function () {


        //===========ENABLES HIT BOX ON PLAYER AND LINEGROUP============
        // this.game.debug.bodyInfo(this.player,80,112);
        // this.game.debug.body(this.player);
        //
        // for (var i = 0; i < this.lineGroup.length; i++) {
        //
        //     this.game.debug.bodyInfo(this.lineGroup.children[i],80,112);
        //     this.game.debug.body(this.lineGroup.children[i]);
        // }
        //
        //


		if(gameOver){
			this.game.input.onDown.add(this.restart, self);
			return;
		}
        //  Collide the player with the platforms
        this.hitPlatform = this.game.physics.arcade.collide(this.player, this.platforms);
		//	Collide player with people in line
		this.game.physics.arcade.overlap(this.player, this.lineGroup, this.hitPatron, null, this);

        //Animation controls for player
        if (this.player.body.touching.down && this.hitPlatform) {
            //  Reset the players velocity if they're touching ground
            this.player.body.velocity.x = 0;
            //this.player.animations.stop();
			if(hasJumped && !this.game.input.mousePointer.isDown){
				this.player.animations.stop();
				this.player.frame = 0;
			}else if(!this.game.input.mousePointer.isDown){
				this.player.animations.stop();
				this.player.frame = 1;
			}else if(this.game.input.mousePointer.isDown){
				//this.player.animations.play('crouch');
			}
        }
		
		if(this.player.body.touching.down && !gameOver && this.player.x>=startWinX && this.player.x<=endWinX){
			this.hasWon();
		}
        if(this.player.body.touching.down && !gameOver && this.player.x>endWinX) {
		    this.hitPatron(this.player,null);
        }

    },
    onDragStop: function (sprite, pointer) {
        lineDrawer.clear();
        var xdiff = sprite.position.x - pointer.x;
        var ydiff = sprite.position.y - pointer.y;
        //console.log("xdiff: " + xdiff + "\nydiff: " + ydiff);
        sprite.body.velocity.x = (xdiff/Math.abs(xdiff))*Math.min(10*Math.abs(xdiff),500);
        sprite.body.velocity.y = (ydiff/Math.abs(ydiff))*Math.min(10*Math.abs(ydiff),1200);
        hasJumped = true;
		this.player.animations.play('fly');
    },
    onDragUpdate: function (sprite,pointer) {
        //TODO Add triangle to top of line to form arrow, then add angle calculations
        lineDrawer.clear();
        if(this.player.body.touching.down) {
            lineDrawer.beginFill(0x21922C);
            lineDrawer.lineStyle(7, 0x21922C, 1);
            lineDrawer.moveTo(sprite.x, sprite.y);
            var xdiff = sprite.position.x - pointer.x;
            var ydiff = sprite.position.y - pointer.y;
            var xThreshhold = (xdiff / Math.abs(xdiff)) * Math.min(10 * Math.abs(xdiff), 500);
            var yThreshhold = (ydiff / Math.abs(ydiff)) * Math.min(10 * Math.abs(ydiff), 1200);
            lineDrawer.lineTo(sprite.x + xdiff * 4, sprite.y + ydiff * 4);
        }


    },
    generateLevelArray: function (array, offsetFromLeft, distFromEachCell) {
        //TODO Perform checks to determine if array can actually be loaded, or if it wont fit on screen, etc
        for (var i = 0; i < array.length; i++) {
            if(!(array[i] === "blank")) {
                var LineObject = this.lineGroup.create(offsetFromLeft + i * distFromEachCell, this.game.height - 175, array[i]);
                LineObject.body.setSize(45,90,18,10);
            }
            else {
                continue;
            }
        }


    },


    phoneGuyAnimationController: function(phoneGuy,delay) {

        phoneGuy.animations.add('lookAtPhone', [0,1,2,3,4,5,6],9,false);
        phoneGuy.animations.add('lookAhead',[7,8,9,10,11],9,false);
        phoneGuyTimer = this.game.time.create(false);
        phoneGuy.play('lookAhead',false);
        var lookingAhead = true;
        var animationToPlay = ((lookingAhead === true) ? 'lookAtPhone' : 'lookAhead');


    },


    generateLineObjectAnimation: function (lineGroup) {

        for ( var i = 0; i < lineGroup.length; i++) {

            if(lineGroup.children[i].key === 'phoneguy') {

                this.phoneGuyAnimationController(lineGroup.children[i],5);
            }
        }
    },




    getLineElmtX: function(LineGroup, index) { // Currently returns the x coord at which the sprite begins
        //TODO add the pixel width of the sprite to get the x coord at which the sprite ends
        var lineElement = LineGroup.children[index];
        position = lineElement.position.x;

        return position;
    },
	hitPatron: function(player, patron){
		console.log("you lose");
		this.gameOverText = this.game.add.text(this.game.world.centerX, this.game.world.centerY, 'Game Over\nClick to restart', { fontSize: '32px', fill: '#000', align:"center" });
		this.gameOverText.anchor.setTo(0.5,0.5);
		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;
		this.player.inputEnabled = false;
		this.player.body.gravity.y = 0;
		gameOver=true;
	},
	restart: function(won){
		goToLevel=gameWon?this.currentLevel+1:this.currentLevel;
		gameOver=false;
		gameWon=false;
		hasJumped=false;
		starCuts.game.state.start('Game',true,false, goToLevel);
	},
	hasWon: function(){
		console.log("you win");
		this.gameWonText = this.game.add.text(this.game.world.centerX, this.game.world.centerY, 'You Win\nClick to move on to next level', { fontSize: '32px', fill: '#000', align:"center" });
		this.gameWonText.anchor.setTo(0.5,0.5);
		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;
		this.player.inputEnabled = false;
		this.player.body.gravity.y = 0;
		gameWon=true;
		gameOver=true;
		
	},
	onDragStart:function(sprite,pointer){
		this.player.animations.play('crouch');
	}





};
