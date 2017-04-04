/*used
https://gamedevacademy.org/html5-phaser-tutorial-top-down-games-with-tiled/
as starting point
findPath()-A* function completely origninal John Martin code*/


var TopDownGame = TopDownGame || {};
//title screen
TopDownGame.Game = function(){};

var hasJumped=false;

TopDownGame.Game.prototype = {
  create: function() {
       //  A simple background for our game
    this.game.add.sprite(0, 0, 'sky');

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
    this.player = this.game.add.sprite(48, this.game.world.height - 125, 'dude');

    //  We need to enable physics on the player
    this.game.physics.arcade.enable(this.player);

    //set anchor
    this.player.anchor.setTo(0.5,0.5);

    //  Player physics properties. Give the little guy a slight bounce.
    this.player.body.bounce.y = 0.1;
    this.player.body.gravity.y = 1300;
    this.player.body.collideWorldBounds = true;
    this.player.scale.setTo(2,2);

    //  Our two animations, walking left and right.
    //TODO consider jumping/landing animations
    this.player.animations.add('left', [0, 1, 2, 3], 10, true);
    this.player.animations.add('right', [5, 6, 7, 8], 10, true);
    
    //resizes the game world to match the layer dimensions
    //this.backgroundlayer.resizeWorld();

    //move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();

    //working on new jump
    this.player.inputEnabled=true;
    this.player.input.enableDrag();
    //prevent player from actually moving
    this.player.input.setDragLock(false,false);
    this.player.events.onDragStop.add(this.onDragStop, this);
    
    
  },
  update: function() {
    //  Collide the player and the stars with the platforms
    this.hitPlatform = this.game.physics.arcade.collide(this.player, this.platforms);
    
    //tmp movement controls, TODO replaced with new jump later
    if(this.player.body.touching.down && this.hitPlatform){
        //  Reset the players velocity if they're touching ground
        this.player.body.velocity.x = 0;
        this.player.animations.stop();
        this.player.frame = 4;
    }else if (this.player.body.velocity.x<0){
        //  Move to the left
        this.player.animations.play('left');
    }
    else if (this.player.body.velocity.x>0){
        //  Move to the right
        this.player.animations.play('right');
    }
    //  Allow the player to jump if they are touching the ground.
    if (this.cursors.up.isDown && this.player.body.touching.down && this.hitPlatform)
    {
        this.player.body.velocity.y = -350;
    }
  },
    onDragStop: function(sprite, pointer){
        var xdiff=sprite.position.x-pointer.x;
        var ydiff=sprite.position.y-pointer.y;
        console.log("xdiff: "+xdiff+"\nydiff: "+ydiff);
        sprite.body.velocity.x=10*xdiff;
        sprite.body.velocity.y=10*ydiff;
        hasJumped=true;
    }
};