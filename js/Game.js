var starCuts = starCuts || {};
//title screen
starCuts.Game = function () {
};

var hasJumped = false;
var gameOver=false;
var gameWon=false;
var startWinX=1200;
var endWinX = 1280;
var lineDrawer;

var sampleArray = ['baddie', 'blank', 'baddie', 'baddie', 'blank', 'star', 'baddie', 'star'];

starCuts.Game.prototype = {

    init: function(currentLevel){
        //initiaites state with a specified level
        this.currentLevel = currentLevel;
    },


    create: function () {
        this.sky = this.game.add.sprite(0, 0, 'sky');
        this.sky.scale.setTo(4, 4);

        lineDrawer = this.game.add.graphics(0,0);
        lineDrawer.beginFill(0x21922C);
        lineDrawer.lineStyle(7,0x21922C,0);

        //Initialize and load LineGroup
        this.lineGroup = this.game.add.group();
		this.lineGroup.enableBody = true;
        this.generateLevelArray(sampleArray, 400, 100);
        console.log("X Position of Element:  " + this.getLineElmtX(this.lineGroup,4)); //tests x pos of element at given index

		
		
        //  The platforms group contains the ground and the 2 ledges we can jump on
        this.platforms = this.game.add.group();
        //  We will enable physics for any object that is created in this group
        this.platforms.enableBody = true;

        // Here we create the ground.
        this.ground = this.platforms.create(0, this.game.world.height - 64, 'ground');
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        this.ground.scale.setTo(4, 4);
        //  This stops it from falling away when you jump on it
        this.ground.body.immovable = true;

        // The player and its settings
        this.player = this.game.add.sprite(64, this.game.world.height - 125, 'dude');

        //  We need to enable physics on the player
        this.game.physics.arcade.enable(this.player);

        //set anchor of player
        this.player.anchor.setTo(0.5, 0.5);

        //  Player physics properties. Give the little guy a slight bounce.
        this.player.body.bounce.y = 0.1;
        this.player.body.gravity.y = 1300;
        this.player.body.collideWorldBounds = true;
        this.player.scale.setTo(2, 2);

        //  Our two animations, walking left and right.
        //TODO consider jumping/landing animations
        this.player.animations.add('left', [0, 1, 2, 3], 10, true);
        this.player.animations.add('right', [5, 6, 7, 8], 10, true);

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
    },
    update: function () {


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
            this.player.animations.stop();
            this.player.frame = 4;
        }
        else if (this.player.body.velocity.x < 0) {
            //  Move to the left
            this.player.animations.play('left');
        }
        else if (this.player.body.velocity.x > 0) {
            //  Move to the right
            this.player.animations.play('right');
        }
		
		if(this.player.body.touching.down && !gameOver && this.player.x>=startWinX && this.player.x<=endWinX){
			this.hasWon();
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
    },
    onDragUpdate: function (sprite,pointer) {
        //TODO Add triangle to top of line to form arrow, then add angle calculations
        lineDrawer.clear();
        lineDrawer.beginFill(0x21922C);
        lineDrawer.lineStyle(7,0x21922C,1);
        lineDrawer.moveTo(sprite.x,sprite.y);
        var xdiff = sprite.position.x - pointer.x;
        var ydiff = sprite.position.y - pointer.y;
        var xThreshhold = (xdiff/Math.abs(xdiff))*Math.min(10*Math.abs(xdiff),500);
        var yThreshhold = (ydiff/Math.abs(ydiff))*Math.min(10*Math.abs(ydiff),1200);
        lineDrawer.lineTo(sprite.x+xdiff*4,sprite.y+ydiff*4);


    },
    generateLevelArray: function (array, offsetFromLeft, distFromEachCell) {
        //TODO Perform checks to determine if array can actually be loaded, or if it wont fit on screen, etc
        for (var i = 0; i < array.length; i++) {
            if(!(array[i] === "blank")) {
                var LineObject = this.lineGroup.create(offsetFromLeft + i * distFromEachCell, this.game.height - 150, array[i]);
                LineObject.scale.setTo(2, 2);
            }
            else {
                continue;
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
		this.gameOverText.anchor.setTo(0.5,0.5)
		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;
		this.player.inputEnabled = false;
		this.player.body.gravity.y = 0;
		gameOver=true;
	},
	restart: function(won){
		goToLevel=gameWon?this.currentLevel+1:this.currentLevel
		gameOver=false;
		gameWon=false;
		hasJumped=false;
		starCuts.game.state.start('Game',true,false, goToLevel);
	},
	hasWon: function(){
		console.log("you win");
		this.gameWonText = this.game.add.text(this.game.world.centerX, this.game.world.centerY, 'You Win\nClick to move on to next level', { fontSize: '32px', fill: '#000', align:"center" });
		this.gameWonText.anchor.setTo(0.5,0.5)
		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;
		this.player.inputEnabled = false;
		this.player.body.gravity.y = 0;
		gameWon=true;
		gameOver=true;
		
	}


};
