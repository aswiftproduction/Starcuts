var starCuts = starCuts || {};
//title screen
starCuts.Game = function () {
};

var hasJumped = false;
var hasnudged = false;
var gameOver=false;
var gameWon=false;
var winsize=300;
var startWinX=1280-winsize;
var endWinX = Number.MAX_SAFE_INTEGER;
var lineDrawer;
var worldBound=1280;
var currentLevel;
var enemyLeftOffset=600;
var enemySpacing=125;
var lossPositions = [];
var isChecking = false;
var isInvincible=false;
var invincibleTimer=-1;

var levelsArray=[['blank', 'blank','blank','blank', 'blank'],
				['blank', 'blank', 'blank', 'pinknpc', 'blank','borednpc','blank'],
				['phoneguy', 'blank', 'borednpc','blank', 'talking_r'],
				['blank', 'blank','borednpc','blank', 'pacingguy','blank','blank','talking_l','blank', 'borednpc','pinknpc', 'talking_l','blank', 'borednpc'],
                ['phoneguy','blank','borednpc','pacingguy','pinknpc','talking_l','blank','borednpc'],
                ['tossingguy'],
                ['borednpc','blank','phoneguy','blank','talking_r'],
                ['tossingguy','pacingguy','blank','blank','talking_r','phoneguy','blank','talking_l','tossingguy'],
                ['borednpc','blank','pacingguy','blank','blank','borednpc','pacingguy','blank','blank','pacingguy','blank','pinknpc'],
                ['pinknpc','borednpc','talking_l','blank','blank','pacingguy','blank','blank','tossingguy'],
                ['tossingguy','tossingguy','tossingguy','tossingguy','tossingguy','tossingguy'],
                []];
var tutorialTextArray=["You're late for class and need some coffee to make it.\nClick and drag on your character to fling yourself toward the register\n(Press 'I' to become invincible)",
	"You don't have time to wait in line.\nJump over the patient patrons",
	"Cut the guy when he is looking at his phone"];
var levelJson=[{enemies:['blank'],
                text:"You're late for class and need some coffee to make it.\nClick and drag on your character to fling yourself toward the register\n(Press 'I' to become invincible)"},
               {enemies:['blank', 'blank', 'pinknpc', 'blank'],
                text:"Cut the guy when he is looking at his phone."},
               {enemies:['pinknpc', 'blank', 'pinknpc', 'blank', 'pinknpc'],
                text:""},
];

var loseTextArray=[];
loseTextArray["PhoneGuy"] = "The guy behind you saw you cut!";
loseTextArray["Collision"] = "You collided with another person!";
loseTextArray["TossingGuy"] = "You collided with the guy's phone!";
loseTextArray["OutOfBounds"] = "You have fallen out of bounds!";
var progress;



starCuts.Game.prototype = {

    init: function(currentLevel){
        //initiaites state with a specified level
        if (currentLevel == 12)
            levelsArray[11] = array100();
        this.currentLevel = currentLevel;
		console.log("current level: "+this.currentLevel);
		if(this.currentLevel>levelsArray.length || this.currentLevel<1)
			this.state.start('MainMenu');
		this.levelText=this.game.add.text(16, 16, 'Level '+this.currentLevel, { fontSize: '32px', fill: '#000' });
		this.levelText.fixedToCamera = true;
		this.tutorialText=this.game.add.text(16, 200, tutorialTextArray[currentLevel-1], { fontSize: '16px', fill: '#000' });
    },


    create: function () {
        //this.background = this.game.add.sprite(0, 0, 'background');
		progress = this.game.add.image(0, 0, "preloadbar");
		console.log(progress);
		progress.fixedToCamera=true;
		progress.width = 0;
		progress.initialWidth = 1280 // the original image width in pixels
		// then on updateprogress.width = percentDone*progress.initialWidth; 
		// percentDone should be in decimals 20% = 0.2// so this will finaly result in 1 * 300 = 100%
		lossPositions=[];
		tmpLevelWidth=levelsArray[this.currentLevel-1].length*enemySpacing+enemyLeftOffset+winsize;
		worldBound=tmpLevelWidth<1280?1280:tmpLevelWidth;
		this.game.world.setBounds(0, 0, worldBound, this.game.height);

        lineDrawer = this.game.add.graphics(0,0);
        lineDrawer.beginFill(0x21922C);
        lineDrawer.lineStyle(7,0x21922C,0);

        //Initialize and load LineGroup
        this.lineGroup = this.game.add.group();
		this.lineGroup.enableBody = true;



        this.game.input.onDown.add(this.nudge,this);


		//renders sprites in the lineGroup
        this.generateLevelArray(levelsArray[this.currentLevel-1], enemyLeftOffset,enemySpacing);

        for(var i = 0; i < this.lineGroup.length; i++) {


            if (this.lineGroup.children[i].key === 'phoneguy') {
                lossPositions.push([this.lineGroup.children[i].x, this.lineGroup.children[i+1].x]);
                console.log(lossPositions);
            }

        }


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

        //add menu button
        this.inGameMenu();
		//add cashier
		this.game.add.sprite(worldBound-170, this.game.world.height - 64-156, 'cashier');
		
        // The player and its settings
        this.player = this.game.add.sprite(250, this.game.world.height - 125, 'player');

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

		this.bgMusic=this.game.add.audio('bgmusic');
		this.loseSound=this.game.add.audio('oww');

		this.bgMusic.play();
		
		spacebar=this.game.input.keyboard.addKey(Phaser.KeyCode.I);
		numpadKey3=this.game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_3);
		numpadKey1=this.game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_1);
		numpadKey2=this.game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_2);
		mKey=this.game.input.keyboard.addKey(Phaser.KeyCode.M);
		nKey=this.game.input.keyboard.addKey(Phaser.KeyCode.N);
		//console.log(this.player);

    },
    update: function () {
     //
     // //   ===========ENABLES HIT BOX ON PLAYER AND LINEGROUP============
     //    this.game.debug.bodyInfo(this.player,80,112);
     //    this.game.debug.body(this.player);
     //
     //    for (var i = 0; i < this.lineGroup.length; i++) {
     //
     //        this.game.debug.bodyInfo(this.lineGroup.children[i],80,112);
     //        this.game.debug.body(this.lineGroup.children[i]);
     //    }
     //
		progress.width = (this.player.x/(worldBound)) * progress.initialWidth;
		
		numpadKey1.onUp.add(function(){starCuts.game.state.start('Game',true,false, 1);this.bgMusic.stop();},this);
		numpadKey2.onUp.add(function(){starCuts.game.state.start('Game',true,false, 2);this.bgMusic.stop();},this);
		numpadKey3.onUp.add(function(){starCuts.game.state.start('Game',true,false, 3);this.bgMusic.stop();},this);
		mKey.onUp.add(function(){starCuts.game.state.start('Game',true,false, this.currentLevel+1);this.bgMusic.stop();},this);
		if(this.currentLevel>1)
			nKey.onUp.add(function(){starCuts.game.state.start('Game',true,false, this.currentLevel-1);this.bgMusic.stop();},this);
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
            hasJumped = false;
            hasnudged = false;
            if (!hasJumped && !this.game.input.mousePointer.isDown && this.player.x != 250) {
                this.player.animations.stop();
                console.log("Land Animation");
                this.player.frame = 0;
            } else if (!this.game.input.mousePointer.isDown) {
                this.player.animations.stop();
                this.player.frame = 1;
            } else if (this.game.input.mousePointer.isDown) {
                //this.player.animations.play('crouch');
            }

        }

        if (/*this.player.body.touching.down && */this.hitPlatform && !gameOver && this.player.x - this.game.camera.x >= startWinX && this.player.x - this.game.camera.x <= endWinX) {
            this.hasWon();
        }
        if (/*this.player.body.touching.down && */this.hitPlatform && !gameOver && this.player.x - this.game.camera.x > endWinX) {
            this.hitPatron(this.player, null,loseTextArray["OutOfBounds"]);
        }




        if (this.hitPlatform) {
            var hasLost = false;
            hasLanded = true;
			if(!isInvincible){
				this.checkLand();
			}

        }


        for (var x = 0; x < this.lineGroup.length; x++){

        	//Pacing guy
			if (this.lineGroup.children[x].key === "pacingguy")
        	this.lineGroup.children[x].ai();
		
			//Tossing guy
			if(this.lineGroup.children[x].key === "tossingguy"){
				var tmpTossingGuy=this.lineGroup.children[x];
				if(tmpTossingGuy.isThrowing && tmpTossingGuy.phone.body.y>(this.game.height - 110)){
					tmpTossingGuy.isThrowing=false;
					tmpTossingGuy.phone.body.y=this.game.height - 105;
					tmpTossingGuy.phone.body.velocity.x=0;
					tmpTossingGuy.phone.body.velocity.y=0;
					tmpTossingGuy.phone.body.gravity.y=0;
				}
				if(!isInvincible)
					this.game.physics.arcade.overlap(this.player, tmpTossingGuy.phone, this.hitPatron, null, this);
			}
		}


    },


    checkLand: function() {

        if(!isChecking) {
			var xValue = this.player.x;
			isChecking = true;
			for(var i=0;i<lossPositions.length;i++){
				x=lossPositions[i];
				if(x[0]<=xValue && x[1]>xValue){
					console.log(lossPositions[0][0] + " < x < " + lossPositions[0][1]);
					this.hitPatron(this.player,null,loseTextArray["PhoneGuy"]);
				}
			}
			/*
			//assumed phone guy was always first and assumed there was always one enemy, generalized above
			//var isLooking = new Boolean(this.lineGroup.children[0].lookUp);
            if((isLooking.valueOf() == true) && (lossPositions[0][0] <= xValue && xValue < lossPositions[0][1])) {
                //console.log("Look:" + isLooking.toString() + " x:" + xValue);
                console.log(lossPositions[0][0] + " < x < " + lossPositions[0][1]);
                this.hitPatron(this.player,null);
            }
			*/
        }

    },

    onDragStop: function(sprite, pointer) {
        lineDrawer.clear();
        var xdiff = sprite.position.x - (pointer.x+this.game.camera.x);
        var ydiff = sprite.position.y - pointer.y;
        //console.log((ydiff/Math.abs(ydiff))*Math.min(10*Math.abs(ydiff),1200));
        sprite.body.velocity.x = (xdiff/Math.abs(xdiff))*Math.min(10*Math.abs(xdiff),500);
        sprite.body.velocity.y = (ydiff/Math.abs(ydiff))*Math.min(10*Math.abs(ydiff),1200);
        hasJumped = true;
		this.player.animations.play('fly');
		this.jumpSound.play();
		isChecking = false;
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
                if (array[i] === "pacingguy") {

                    var LineObject = this.lineGroup.create(offsetFromLeft + i * distFromEachCell, this.game.height - 170, array[i]);
                    LineObject.body.setSize(45,90,18,10);

                }
                else {
                    var LineObject = this.lineGroup.create(offsetFromLeft + i * distFromEachCell, this.game.height - 175, array[i]);
                    LineObject.body.setSize(45,90,18,10);

                }

            }
            else {

                continue;
            }
        }


    },


    phoneGuyAnimationController: function(phoneGuy,delay,lineNumber) {
        timer = this.game.time.create();

        timer.loop(delay * 200 * this.game.rnd.integerInRange(4,9),this.phoneGuyTimerFunction,this,phoneGuy,phoneGuy.x,lineNumber);
        timer.start();
    },


    phoneGuyTimerFunction: function (phoneGuy,xPosition,lineNumber) {
        if(phoneGuy.lookUp) {
            phoneGuy.animations.play('lookAtPhone',false);
            //lossPositions[lineNumber] = [xPosition, xPosition + 300];
			lossPositions[lineNumber] = [0,0];
        }

        else {
            phoneGuy.animations.play('lookAhead',false);
            //lossPositions[lineNumber] = [0,0];
			lossPositions[lineNumber] = [xPosition, xPosition + 300];
        }
        phoneGuy.lookUp = !phoneGuy.lookUp;

    },

    pacingGuyAnimationController: function(pacingGuy,speed,endX) {

        pacingGuy.startX = pacingGuy.x;
        pacingGuy.endX = endX;
        pacingGuy.speed = speed;
        pacingGuy.body.velocity.x = 100;

    },



    tossingGuyAnimationController: function(tossingGuy,delay) {
		timer = this.game.time.create();
        timer.loop(delay * 1000,this.tossingGuyTimerFunction,this,tossingGuy);
        timer.start();
    },
	tossingGuyTimerFunction: function (tossingGuy){
		if(!tossingGuy.isThrowing){
			tossingGuy.animations.play('full');
			tossingGuy.isThrowing=true;
			tossingGuy.phone.body.gravity.y = 1300;
			//tossingGuy.phone.body.collideWorldBounds = true;
			tossingGuy.phone.body.velocity.y=-1200;
		}
		
	},




    generateLineObjectAnimation: function (lineGroup) {
        var numPhoneGuys = 0;
        for ( var i = 0; i < lineGroup.length; i++) {

            if(lineGroup.children[i].key === 'phoneguy') {

                lineGroup.children[i].animations.add('lookAtPhone', [0,1,2,3,4,5,6],9,false);
                lineGroup.children[i].animations.add('lookAhead',[7,8,9,10,11],9,false);
                lineGroup.children[i].lookUp = true;
                this.phoneGuyAnimationController(lineGroup.children[i],5,numPhoneGuys);
                numPhoneGuys += 1;
            }

            else if(lineGroup.children[i].key === 'pacingguy') {


                lineGroup.children[i].animations.add('walkLeft', [6,7,8,9,10,11],12,true);
                lineGroup.children[i].animations.add('walkRight', [0,1,2,3,4,5],12,true);
                this.pacingGuyAnimationController(lineGroup.children[i],10,lineGroup.children[i+1].x); // Pacing guy cannot be last guy
				console.log(lineGroup.children[i]);
				lineGroup.children[i].ai = function(){

					if ( (this.x < this.startX) || (this.x > this.endX)) {
						this.body.velocity.x *= -1;
						this.body.x = this.body.x + this.body.velocity.x * .04;
					}

					if (this.body.velocity.x > 0) {
						this.animations.play("walkRight");
					}
					if  (this.body.velocity.x < 0) {
						this.animations.play("walkLeft");
					}
				}

            }

            else if(lineGroup.children[i].key === 'tossingguy') {

                lineGroup.children[i].animations.add('tossup', [0,1,2,3,4,5,6]);
                lineGroup.children[i].animations.add('catch', [6,7,8,9,10,11]);
				lineGroup.children[i].animations.add('full', [0,1,2,3,4,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,8,9,10,11],24,false);
				lineGroup.children[i].isThrowing=false;
				lineGroup.children[i].phone = this.game.add.sprite(lineGroup.children[i].x+50, this.game.world.height - 105, 'phone');
				this.game.physics.arcade.enable(lineGroup.children[i].phone);
				lineGroup.children[i].phone.body.gravity.y = 0;
				lineGroup.children[i].phone.body.bounce.y = 1.0;
				lineGroup.children[i].phone.body.collideWorldBounds = true;
				lineGroup.children[i].phone.body.velocity.y=0;
				
				this.tossingGuyAnimationController(lineGroup.children[i],1.5+2*Math.random());
				
            }

            else {

            }
        }
    },




    getLineElmtX: function(LineGroup, index) { // Currently returns the x coord at which the sprite begins
        //TODO add the pixel width of the sprite to get the x coord at which the sprite ends
        var lineElement = LineGroup.children[index];
        position = lineElement.position.x;

        return position;
    },
	hitPatron: function(player, patron, text){
		console.log("you lose");

		if(!text) {
            text = loseTextArray["Collision"];
        }
		this.gameOverText = this.game.add.text(this.game.camera.x+640, this.game.world.centerY, 'Game Over\n' + text + '\nClick to restart', { fontSize: '32px', fill: '#000', align:"center" });
		this.gameOverText.anchor.setTo(0.5,0.5);


        this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;
		this.player.inputEnabled = false;
		this.player.body.gravity.y = 0;
		this.loseSound.play();
        this.game.physics.arcade.isPaused=true;
		gameOver=true;

	},
	restart: function(self){
        this.game.physics.arcade.isPaused=false;
		goToLevel=gameWon?this.currentLevel+1:this.currentLevel;
		this.bgMusic.stop();
		gameOver=false;
		gameWon=false;
		hasJumped=false;
		starCuts.game.state.start('Game',true,false, goToLevel);
	},
	hasWon: function(){
		console.log("you win");
		this.gameWonText = this.game.add.text(this.game.camera.x+640, this.game.world.centerY, 'You Win\nClick to move on to next level', { fontSize: '32px', fill: '#000', align:"center" });
		this.gameWonText.anchor.setTo(0.5,0.5);
        this.game.physics.arcade.isPaused=true;
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
	},


    inGameMenu: function(){
	    inGameMenu = this.game.add.sprite(10, 60 , 'menu');
        inGameMenu.fixedToCamera = true;
        inGameMenu.alpha = 0.5;
        inGameMenu.inputEnabled = true;
        inGameMenu.events.onInputOver.add(function () {
            this.alpha = 1;
        }, inGameMenu);
        inGameMenu.events.onInputOut.add(function () {
            this.alpha = 0.8;
        }, inGameMenu);


        inGameMenu.events.onInputDown.add(function(){
            menu = this.game.add.sprite(this.game.width/2, this.game.height/2,'pause menu');
            menu.anchor.setTo(0.5,0.5);
            menu.fixedToCamera = true;

            mainMenu = this.game.add.sprite(menu.x, menu.y - 120, 'main menu b');
            mainMenu.anchor.setTo(0.5,0.5);
            mainMenu.fixedToCamera = true;
            mainMenu.alpha = 0.5;
            mainMenu.inputEnabled = true;
            mainMenu.events.onInputOver.add(function () {
                this.alpha = 1;
            }, mainMenu);
            mainMenu.events.onInputOut.add(function () {
                this.alpha = 0.8;
            }, mainMenu);
            mainMenu.events.onInputDown.add(function() {
				this.bgMusic.stop();
                starCuts.game.state.start('MainMenu');
            }, this);

            levelSelect = this.game.add.sprite(menu.x, menu.y + 120, 'level select b');
            levelSelect.anchor.setTo(0.5,0.5);
            levelSelect.fixedToCamera = true;
            levelSelect.alpha = 0.5;
            levelSelect.inputEnabled = true;
            levelSelect.events.onInputOver.add(function () {
                this.alpha = 1;
            }, levelSelect);
            levelSelect.events.onInputOut.add(function () {
                this.alpha = 0.8;
            }, levelSelect);
            levelSelect.events.onInputDown.add(function() {
				this.bgMusic.stop();
                starCuts.game.state.start('LevelSelect')
            }, this);

            exit = this.game.add.sprite(250,120, 'exit');
            exit.fixedToCamera = true;
            exit.alpha = 0.5;
            exit.inputEnabled = true;
            exit.events.onInputOver.add(function () {
                this.alpha = 1;
            }, exit);
            exit.events.onInputOut.add(function () {
                this.alpha = 0.8;
            }, exit);
            exit.events.onInputDown.add(function() {
                levelSelect.destroy();
                mainMenu.destroy();
                menu.destroy();
                exit.destroy();
            }, exit);
        }, this);

    },
    nudge: function() {

        if(!this.hitPlatform && !hasnudged) {
            hasnudged = true;
            var velocityOffset = 100;
            if (this.player.x - this.game.camera.x >  this.game.input.x) {
                console.log("The Player's X is > the mouse move forward Player X:" + this.player.x + "Mouse X" + this.game.input.x);
                this.player.body.velocity.x = this.player.body.velocity.x* 0.5 + velocityOffset;
                this.player.body.velocity.y = -500;

            }
            else {
                console.log("The Player's X is < than the mouse, move back Player X:" + this.player.x + "Mouse X" + this.game.input.x);
                this.player.body.velocity.x = 0 - velocityOffset;
                this.player.body.velocity.y = -500;
            }

        }

        else {
            console.log("Hitting the platform, cannot nudge");
        }
    }
};
