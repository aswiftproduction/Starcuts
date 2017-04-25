var starCuts = starCuts || {};
//title screen
starCuts.Game = function () {
};

var hasJumped = false;
var gameOver=false;
var gameWon=false;
var winsize=300;
var startWinX=1280-winsize;
var endWinX = Number.MAX_SAFE_INTEGER;
var lineDrawer;
var worldBound=1280;
var currentLevel;
var enemyLeftOffset=400;
var enemySpacing=125;
var isInvincible=false;
var invincibleTimer=-1;

var sampleArray = ['pinknpc', 'blank', 'pinknpc', 'blank', 'pinknpc', ];
var levelsArray=[['pinknpc', 'blank', 'pinknpc', 'blank', 'pinknpc'],
				['pinknpc', 'blank', 'pinknpc', 'pinknpc', 'borednpc'],
				['pinknpc', 'blank','pinknpc', 'blank','pinknpc', 'blank','pinknpc', 'blank','pinknpc']];
var tutorialTextArray=["You're late for class and need some coffee to make it.\nClick and drag on your character to fling yourself toward the register\n(Press 'I' to become invincible)",
	"You don't have time to wait in line.\nJump over the patient patrons",
	""];
var levelJson=[{enemies:['blank'],
                text:"You're late for class and need some coffee to make it.\nClick and drag on your character to fling yourself toward the register\n(Press 'I' to become invincible)"},
               {enemies:['blank', 'blank', 'pinknpc', 'blank'],
                text:"You don't have time to wait in line.\nJump over the patient patrons"},
               {enemies:['pinknpc', 'blank', 'pinknpc', 'blank', 'pinknpc'],
                text:""},
];

starCuts.Game.prototype = {

    init: function(currentLevel){
        //initiaites state with a specified level
        this.currentLevel = currentLevel;
		console.log("current level: "+this.currentLevel);
		if(this.currentLevel>levelsArray.length || this.currentLevel<1)
			this.state.start('MainMenu');
		//sampleArray=levelsArray[this.currentLevel-1];
		this.levelText=this.game.add.text(16, 16, 'Level '+this.currentLevel, { fontSize: '32px', fill: '#000' });
		this.levelText.fixedToCamera = true;
		this.tutorialText=this.game.add.text(16, 200, tutorialTextArray[currentLevel-1], { fontSize: '16px', fill: '#000' });
    },


    create: function () {
        //this.background = this.game.add.sprite(0, 0, 'background');
		tmpLevelWidth=levelsArray[this.currentLevel-1].length*enemySpacing+enemyLeftOffset+winsize;
		worldBound=tmpLevelWidth<1280?1280:tmpLevelWidth;
		this.game.world.setBounds(0, 0, worldBound, this.game.height);

        lineDrawer = this.game.add.graphics(0,0);
        lineDrawer.beginFill(0x21922C);
        lineDrawer.lineStyle(7,0x21922C,0);

        //Initialize and load LineGroup
        this.lineGroup = this.game.add.group();
		this.lineGroup.enableBody = true;


		//renders sprites in the lineGroup
        this.generateLevelArray(levelsArray[this.currentLevel-1], enemyLeftOffset,enemySpacing);

        this.generateLineObjectAnimation(this.lineGroup);
        //  The platforms group contains the ground and the 2 ledges we can jump on
        //this.platforms = this.game.add.group();
        //  We will enable physics for any object that is created in this group

	    //this.platforms.enableBody = true;
        // Here we create the ground.
		this.ground = this.add.tileSprite(0,this.game.height-64,this.game.world.width,0,'floor');
		this.game.physics.arcade.enable(this.ground);
        this.ground.enableBody = true;
        //  This stops it from falling away when you jump on it
        this.ground.body.immovable = true;
		this.ground.body.allowGravity = false;
		
		//add lamps
		this.drawLamps(200, 30);
		
		//add cashier
		this.game.add.sprite(worldBound-170, this.game.world.height - 64-156, 'cashier');
		
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
		
		//have camera follow player
		this.game.camera.follow(this.player);
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
		this.game.world.bringToTop(this.levelText);
		
		this.jumpSound=this.game.add.audio('jump');
		this.winSound=this.game.add.audio('win');
		
		spacebar=this.game.input.keyboard.addKey(Phaser.KeyCode.I);
		numpadKey3=this.game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_3);
		numpadKey1=this.game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_1);
		numpadKey2=this.game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_2);
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
		numpadKey1.onUp.add(function(){starCuts.game.state.start('Game',true,false, 1);},this);
		numpadKey2.onUp.add(function(){starCuts.game.state.start('Game',true,false, 2);},this);
		numpadKey3.onUp.add(function(){starCuts.game.state.start('Game',true,false, 3);},this);
		
		invincibleTimer=(invincibleTimer>0)?invincibleTimer-1:-1;
		if(invincibleTimer<=0)
			spacebar.onUp.add(function(){if(invincibleTimer<=0){isInvincible=!isInvincible;};invincibleTimer=50},this);
		if(isInvincible)
			this.lineGroup.alpha=0.5;
		else
			this.lineGroup.alpha=1;
		
		
		if(gameOver){
			this.game.input.onDown.add(this.restart,this);
			return;
		}
        //  Collide the player with the platforms
		//this.game.physics.arcade.collide(this.player, this.ground, this.playerHit, null, this);
        this.hitPlatform = this.game.physics.arcade.collide(this.player, this.ground);
		//	Collide player with people in line
		if(!isInvincible)
			this.game.physics.arcade.overlap(this.player, this.lineGroup, this.hitPatron, null, this);

        //Animation controls for player
        if (/*this.player.body.touching.down && */this.hitPlatform) {
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
		
		if(/*this.player.body.touching.down && */this.hitPlatform && !gameOver && this.player.x-this.game.camera.x>=startWinX && this.player.x-this.game.camera.x<=endWinX){
			this.hasWon();
		}
        if(/*this.player.body.touching.down && */this.hitPlatform && !gameOver && this.player.x-this.game.camera.x>endWinX) {
		    this.hitPatron(this.player,null);
        }

    },
    onDragStop: function (sprite, pointer) {
        lineDrawer.clear();
        var xdiff = sprite.position.x - (pointer.x+this.game.camera.x);
        var ydiff = sprite.position.y - pointer.y;
        //console.log("xdiff: " + xdiff + "\nydiff: " + ydiff);
        sprite.body.velocity.x = (xdiff/Math.abs(xdiff))*Math.min(10*Math.abs(xdiff),500);
        sprite.body.velocity.y = (ydiff/Math.abs(ydiff))*Math.min(10*Math.abs(ydiff),1200);
        hasJumped = true;
		this.player.animations.play('fly');
		this.jumpSound.play();
    },
    onDragUpdate: function (sprite,pointer) {
        //TODO Add triangle to top of line to form arrow, then add angle calculations
        lineDrawer.clear();
        if(this.hitPlatform) {
            lineDrawer.beginFill(0x21922C);
            lineDrawer.lineStyle(7, 0x21922C, 1);
            lineDrawer.moveTo(sprite.x, sprite.y);
            var xdiff = sprite.position.x - (pointer.x+this.game.camera.x);
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
		this.gameOverText = this.game.add.text(this.game.camera.x+640, this.game.world.centerY, 'Game Over\nClick to restart', { fontSize: '32px', fill: '#000', align:"center" });
		this.gameOverText.anchor.setTo(0.5,0.5);
		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;
		this.player.inputEnabled = false;
		this.player.body.gravity.y = 0;
		gameOver=true;
	},
	restart: function(self){
		goToLevel=gameWon?this.currentLevel+1:this.currentLevel;
		gameOver=false;
		gameWon=false;
		hasJumped=false;
		starCuts.game.state.start('Game',true,false, goToLevel);
	},
	hasWon: function(){
		console.log("you win");
		this.gameWonText = this.game.add.text(this.game.camera.x+640, this.game.world.centerY, 'You Win\nClick to move on to next level', { fontSize: '32px', fill: '#000', align:"center" });
		this.gameWonText.anchor.setTo(0.5,0.5)
		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;
		this.player.inputEnabled = false;
		this.player.body.gravity.y = 0;
		gameWon=true;
		gameOver=true;
		this.winSound.play();
		
	},
	onDragStart:function(sprite,pointer){
		this.player.animations.play('crouch');
	},
	drawLamps:function(distToNext, leftOffset){
		for(var i=0; i<=(worldBound-leftOffset)/distToNext;i++){
			if(i%2===0)
				this.game.add.sprite(leftOffset+(i*distToNext), 0, 'topLamp');
			else
				this.game.add.sprite(leftOffset+(i*distToNext), -40, 'topLamp');
		}
	}





};
