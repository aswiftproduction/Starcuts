var starCuts = starCuts || {};
//title screen
starCuts.Game = function () {
};

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

var levelsArray=[['blank', 'blank','blank'],
				['blank', 'tallguy', 'sleepingguy', 'blank', 'pinknpc', 'blank','borednpc','blank'],
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
var tutorialTextArray=["You're late for class and need some coffee to make it.\nClick and drag on your character to fling yourself toward the register",
	"You don't have time to wait in line.\nJump over the patient patrons",
	"Cut the guy when he is looking at his phone"];
var levelJson=[{enemies:['blank'],
                text:"You're late for class and need some coffee to make it.\nClick and drag on your character to fling yourself toward the register"},
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
		this.currentLevel = currentLevel;
        //initiaites state with a specified level
        if (currentLevel >= 12){
			numEnemies=Math.min(100*Math.pow(2,(currentLevel-13)),2000);
            levelsArray[11] = array100(numEnemies);
			this.levelText=this.game.add.text(16, 16, 'Bonus Level '+(currentLevel-11)+': '+numEnemies+ ' Enemies', { fontSize: '32px', fill: '#000' });
		}else{
			this.levelText=this.game.add.text(16, 16, 'Level '+this.currentLevel, { fontSize: '32px', fill: '#000' });
		}
		console.log("current level: "+this.currentLevel);
		if(this.currentLevel<1||this.currentLevel>=100+12)
			this.state.start('MainMenu');
		
		this.levelText.fixedToCamera = true;
		this.tutorialText=this.game.add.text(16, 200, tutorialTextArray[currentLevel-1], { fontSize: '16px', fill: '#000' });
    },


    create: function () {
        //adds level progress bar to top of level
		progress = this.game.add.image(0, 0, "preloadbar");
		progress.fixedToCamera=true;
		progress.width = 0;
		progress.initialWidth = 1280 
		//initialize lossPositions, used with phoneGuy
		lossPositions=[];
		//sets level width
		tmpLevelWidth=levelsArray[this.currentLevel>=12?11:(this.currentLevel-1)].length*enemySpacing+enemyLeftOffset+winsize;
		worldBound=tmpLevelWidth<1280?1280:tmpLevelWidth;
		this.game.world.setBounds(0, 0, worldBound, this.game.height);
		//draws the trajectory line
        lineDrawer = this.game.add.graphics(0,0);
        lineDrawer.beginFill(0x21922C);
        lineDrawer.lineStyle(7,0x21922C,0);

        //Initialize and load LineGroup
        this.lineGroup = this.game.add.group();
		this.lineGroup.enableBody = true;
		//adds nudge event handler
        this.game.input.onDown.add(this.nudge,this);

		//renders sprites in the lineGroup
        this.generateLevelArray(levelsArray[this.currentLevel>=12?11:(this.currentLevel-1)], enemyLeftOffset,enemySpacing);
		//fills lossPositions
        for(var i = 0; i < this.lineGroup.length; i++) {
            if (this.lineGroup.children[i].key === 'phoneguy') {
				if(this.lineGroup.children[i+1]!=null){
					lossPositions.push([this.lineGroup.children[i].x, this.lineGroup.children[i+1].x]);
				}else{
					lossPositions.push([this.lineGroup.children[i].x, this.lineGroup.children[i].x+30]);
				}
            }
        }

		//sets all enemy animations and behavior
        this.generateLineObjectAnimation(this.lineGroup);

        // Here we create the ground.
		this.ground = this.add.tileSprite(0,this.game.height-64,this.game.world.width,0,'floor');
		this.game.physics.arcade.enable(this.ground);
        this.ground.enableBody = true;
        //This stops it from falling away when you jump on it
        this.ground.body.immovable = true;
		this.ground.body.allowGravity = false;
		
		//add decorative lamps
		this.drawLamps(200, 30);

        //add menu button
        this.inGameMenu();
		//add cashier at end of level
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
		
		//have camera follow player
		this.game.camera.follow(this.player);
        //Our two animations
        this.player.animations.add('crouch', [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25], 24, false);
        this.player.animations.add('fly', [26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,45,46,47,48,49], 24, true);
        //allow drag input on player
        this.player.inputEnabled = true;
        this.player.input.enableDrag();
        //prevent player from actually moving
        this.player.input.setDragLock(false, false);
		//set up jumping events
        this.player.events.onDragStop.add(this.onDragStop, this);
        this.player.events.onDragUpdate.add(this.onDragUpdate,this);
		this.player.events.onDragStart.add(this.onDragStart,this);
		
		//add level number to top-right of level
		this.game.world.bringToTop(this.levelText);
		
		//add sounds
		this.jumpSound=this.game.add.audio('jump');
		this.winSound=this.game.add.audio('win');
		this.bgMusic=this.game.add.audio('bgmusic');
		this.loseSound=this.game.add.audio('oww');
		this.bgMusic.play();
		
		//setup debug keys
		invincibilityKey=this.game.input.keyboard.addKey(Phaser.KeyCode.I);
		mKey=this.game.input.keyboard.addKey(Phaser.KeyCode.M);
		nKey=this.game.input.keyboard.addKey(Phaser.KeyCode.N);

    },
    update: function () {

     //   ===========ENABLES HIT BOX ON PLAYER AND LINEGROUP============
     //    this.game.debug.bodyInfo(this.player,80,112);
     //    this.game.debug.body(this.player);
     //
     //    for (var i = 0; i < this.lineGroup.length; i++) {
     //
     //        this.game.debug.bodyInfo(this.lineGroup.children[i],80,112);
     //        this.game.debug.body(this.lineGroup.children[i]);
     //    }
		//sets progress bar
		progress.width = (this.player.x/(worldBound-winsize)) * progress.initialWidth;
		
		//DEBUG KEY EVENT HANDLERS
		//sets m and n keys to move level froward backward respectively
		mKey.onUp.add(function(){starCuts.game.state.start('Game',true,false, this.currentLevel+1);this.bgMusic.stop();},this);
		if(this.currentLevel>1){	//only move back a level if not on level 1
			nKey.onUp.add(function(){starCuts.game.state.start('Game',true,false, this.currentLevel-1);this.bgMusic.stop();},this);
		}
		//allows invinicbility key (I) to make player invincible. Makes a visible change to sprites
		invincibleTimer=(invincibleTimer>0)?invincibleTimer-1:-1;
		if(invincibleTimer<=0)
			invincibilityKey.onUp.add(function(){if(invincibleTimer<=0){isInvincible=!isInvincible;};invincibleTimer=50},this);
		if(isInvincible)
			this.lineGroup.alpha=0.5;
		else
			this.lineGroup.alpha=1;
		
		//adds event handler for level restarting on lose/win, prevents other checks from occuring
		if(gameOver){
			this.game.input.onDown.add(this.restart,this);
			return;
		}
        //  Collide the player with the platforms
        this.hitPlatform = this.game.physics.arcade.collide(this.player, this.ground);
		//	Collide player with people in line
		if(!isInvincible){
			this.game.physics.arcade.overlap(this.player, this.lineGroup, this.hitPatron, null, this);
		}

        //if touching the ground
        if (this.hitPlatform) {
            //  Reset the players velocity if they're touching ground
            this.player.body.velocity.x = 0;
			//reste nudge ability
            hasnudged = false;
			
			//TODO: this better
			//if not clicking or at start point set frame to laded pose
            if (!this.game.input.mousePointer.isDown && this.player.x != 250) {
                this.player.animations.stop();
                this.player.frame = 0;
            }
			//if still at start point have default pose
			else if (!this.game.input.mousePointer.isDown) {
                this.player.animations.stop();
                this.player.frame = 1;
            }
			
			//if the game is not over yet
			if(!gameOver){
				//check win condition
				if(((this.player.x-this.game.camera.x)>=startWinX) && ((this.player.x-this.game.camera.x)<=endWinX)){
					this.hasWon();
				}
				//check (unused) lose condition
				/*else if((this.player.x-this.game.camera.x)>endWinX){
					this.hitPatron(this.player, null,loseTextArray["OutOfBounds"]);
				}*/
				//calls checkLand (lose if phoneGuy)
				else if(!isInvincible){
					this.checkLand();
				}
			}
        }
		
		//iterates over all enemies
        for (var x = 0; x < this.lineGroup.length; x++){
        	//Pacing guy
			if (this.lineGroup.children[x].key === "pacingguy"){
				this.lineGroup.children[x].ai();
			}
			//TossingGuy
			else if(this.lineGroup.children[x].key === "tossingguy"){
				var tmpTossingGuy=this.lineGroup.children[x];
				if(tmpTossingGuy.isThrowing && tmpTossingGuy.phone.body.y>(this.game.height - 110)){
					tmpTossingGuy.isThrowing=false;
					tmpTossingGuy.phone.body.y=this.game.height - 105;
					tmpTossingGuy.phone.body.velocity.x=0;
					tmpTossingGuy.phone.body.velocity.y=0;
					tmpTossingGuy.phone.body.gravity.y=0;
				}
				if(!isInvincible){
					this.game.physics.arcade.overlap(this.player, tmpTossingGuy.phone, function(){this.hitPatron(this.player,tmpTossingGuy.phone,loseTextArray["TossingGuy"]);},null, this);
				}
			}
		}
    },

	//checks if the player is safe where they landed
    checkLand: function() {
		//isChecking is false if the player has landed and this function has yet to be called
        if(!isChecking) {
			var xValue = this.player.x;
			isChecking = true;
			for(var i=0;i<lossPositions.length;i++){
				x=lossPositions[i];
				if(x[0]<=xValue && x[1]>xValue){
					//console.log(lossPositions[0][0] + " < x < " + lossPositions[0][1]);
					this.hitPatron(this.player,null,loseTextArray["PhoneGuy"]);
				}
			}
        }
    },
	//When the player finished dragging, jump
    onDragStop: function(sprite, pointer) {
		//disables double jump unless cheats are activated
		if(isInvincible || this.hitPlatform){
			lineDrawer.clear();
			var xdiff = sprite.position.x - (pointer.x+this.game.camera.x);
			var ydiff = sprite.position.y - pointer.y;
			//console.log((ydiff/Math.abs(ydiff))*Math.min(10*Math.abs(ydiff),1200));
			sprite.body.velocity.x = (xdiff/Math.abs(xdiff))*Math.min(10*Math.abs(xdiff),500);
			sprite.body.velocity.y = (ydiff/Math.abs(ydiff))*Math.min(10*Math.abs(ydiff),1200);
			this.player.animations.play('fly');
			this.jumpSound.play();
			isChecking = false;
		}
    },
	//Displays arrow aprroximately proportional to player's launch velocity
    onDragUpdate: function (sprite,pointer) {
        //TODO Add triangle to top of line to form arrow, then add angle calculations
        lineDrawer.clear();
		//Only draw the arrow if the player is touching the ground
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
	//fills lineGroup with the enemies it is to contain
    generateLevelArray: function (array, offsetFromLeft, distFromEachCell) {
        //TODO Perform checks to determine if array can actually be loaded, or if it wont fit on screen, etc
        for (var i = 0; i < array.length; i++) {
            if(!(array[i] === "blank")) {
                if (array[i] === "pacingguy") {

                    var LineObject = this.lineGroup.create(offsetFromLeft + i * distFromEachCell, this.game.height - 170, array[i]);
                    LineObject.body.setSize(45,90,18,10);

                }else if (array[i] === "tallguy") {

                    var LineObject = this.lineGroup.create(offsetFromLeft + i * distFromEachCell, this.game.height - 265, array[i]);
                    LineObject.body.setSize(45,190,2,0);

                }else if (array[i] === "phoneguy") {

                    var LineObject = this.lineGroup.create(offsetFromLeft + i * distFromEachCell, this.game.height - 175, array[i]);
                    LineObject.body.setSize(45,100,5,0);

                }else if (array[i] === "sleepingguy") {

                    var LineObject = this.lineGroup.create(offsetFromLeft + i * distFromEachCell, this.game.height - 120, array[i]);
                    LineObject.body.setSize(95,45,10,10);

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
	//sets up each phoneGuy's timer loop for checing their phone
    phoneGuyAnimationController: function(phoneGuy,delay,lineNumber) {
        timer = this.game.time.create();
        timer.loop(delay * 200 * this.game.rnd.integerInRange(4,9),this.phoneGuyTimerFunction,this,phoneGuy,phoneGuy.x,lineNumber);
        timer.start();
    },
	//called whe phoneguy switches between checking and not checking his phone
    phoneGuyTimerFunction: function (phoneGuy,xPosition,lineNumber) {
        if(phoneGuy.lookUp) {
            phoneGuy.animations.play('lookAtPhone',false);
			lossPositions[lineNumber] = [0,0];
        }

        else {
            phoneGuy.animations.play('lookAhead',false);
			lossPositions[lineNumber] = [xPosition, xPosition + 300];
        }
        phoneGuy.lookUp = !phoneGuy.lookUp;

    },
	//sets up pacingGuys properties, start location, end location and speed
    pacingGuyAnimationController: function(pacingGuy,speed,endX) {

        pacingGuy.startX = pacingGuy.x;
        pacingGuy.endX = endX;
        pacingGuy.speed = speed;
        pacingGuy.body.velocity.x = 100;

    },
	//sets up tossingGuy's timer loop for throwing his phone
    tossingGuyAnimationController: function(tossingGuy,delay) {
		timer = this.game.time.create();
        timer.loop(delay * 1000,this.tossingGuyTimerFunction,this,tossingGuy);
        timer.start();
    },
	//called every time tossingGuy tosses his phone
	tossingGuyTimerFunction: function (tossingGuy){
		if(!tossingGuy.isThrowing){
			tossingGuy.animations.play('full');
			tossingGuy.isThrowing=true;
			tossingGuy.phone.body.gravity.y = 1300;
			tossingGuy.phone.body.velocity.y=-1200;
		}
		
	},
	//adds behavior and animations to all enemies
    generateLineObjectAnimation: function (lineGroup) {
        var numPhoneGuys = 0;
        for ( var i = 0; i < lineGroup.length; i++) {
			//adds each phoneguy's animations and sets up their timer loop
            if(lineGroup.children[i].key === 'phoneguy') {

                lineGroup.children[i].animations.add('lookAtPhone', [0,1,2,3,4,5,6],9,false);
                lineGroup.children[i].animations.add('lookAhead',[7,8,9,10,11],9,false);
                lineGroup.children[i].lookUp = true;
                this.phoneGuyAnimationController(lineGroup.children[i],5,numPhoneGuys);
                numPhoneGuys += 1;
            }
			//adds each pacingGuy's animations and sets their properties for where they walk
            else if(lineGroup.children[i].key === 'pacingguy') {
                lineGroup.children[i].animations.add('walkLeft', [6,7,8,9,10,11],12,true);
                lineGroup.children[i].animations.add('walkRight', [0,1,2,3,4,5],12,true);
                this.pacingGuyAnimationController(lineGroup.children[i],10,lineGroup.children[i+1].x); // Pacing guy cannot be last guy
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
			//adds each tossingGuy's animations and sets up their throwing timer
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
	//returns the 'index'th enemie in LineGroup
    getLineElmtX: function(LineGroup, index) { // Currently returns the x coord at which the sprite begins
        //TODO add the pixel width of the sprite to get the x coord at which the sprite ends
        var lineElement = LineGroup.children[index];
        position = lineElement.position.x;

        return position;
    },
	//Called when the player has encountered a lose condition
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
	//restarts the current level is lost or starts the next levl if won
	restart: function(self){
        this.game.physics.arcade.isPaused=false;
		goToLevel=gameWon?this.currentLevel+1:this.currentLevel;
		this.bgMusic.stop();
		gameOver=false;
		gameWon=false;
		starCuts.game.state.start('Game',true,false, goToLevel);
	},
	//pauses physics adds congratulatory text and displays a winning animation/sound
	hasWon: function(){
		console.log("you win");
		this.coffee = this.game.add.sprite(this.player.x - 42, this.player.y - 130, 'coffee');
		this.coffee.animations.add('win',[0,1,2,3],10, true);
		this.coffee.animations.play('win');
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
	//plays the crouching animation when a drag has started
	onDragStart:function(sprite,pointer){
		this.player.animations.play('crouch');
	},
	//adds decorative lamps at startup
	drawLamps:function(distToNext, leftOffset){
		for(var i=0; i<=(worldBound-leftOffset)/distToNext;i++){
			if(i%2===0)
				this.game.add.sprite(leftOffset+(i*distToNext), 0, 'topLamp');
			else
				this.game.add.sprite(leftOffset+(i*distToNext), -40, 'topLamp');
		}
	},
	//provides a menu while in a level
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

		//scary stuff in here
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
	//allows the player to nudge themselves once per jump
    nudge: function() {
        if(!this.hitPlatform && !hasnudged) {
            hasnudged = true;
            var velocityOffset = 100;
            if (this.player.x - this.game.camera.x >  this.game.input.x) {
                //console.log("The Player's X is > the mouse move forward Player X:" + this.player.x + "Mouse X" + this.game.input.x);
                this.player.body.velocity.x = this.player.body.velocity.x* 0.5 + velocityOffset;
                this.player.body.velocity.y = -500;

            }
            else {
                //console.log("The Player's X is < than the mouse, move back Player X:" + this.player.x + "Mouse X" + this.game.input.x);
                this.player.body.velocity.x = 0 - velocityOffset;
                this.player.body.velocity.y = -500;
            }

        }/*
        else {
            console.log("Hitting the platform, cannot nudge");
        }*/
    }
};
