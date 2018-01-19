let allEnemies = [],
    player,
    enemy,
    gem,
    countdown,
    skin = 'images/char-boy.png';

// Enemies our player must avoid
var Enemy = function(location, speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png',
    this.x = location.x,
    this.y = location.y,
    this.speed = speed || this.getRandomSpeed();
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype = {

    update: function(dt) {
        // You should multiply any movement by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.
        this.x += this.speed * dt;
        //Reset position and speed when bug leaves screen
        if(this.x > 505) {
            this.x = -101;
            this.y = this.getRandomRow();
            this.speed = this.getRandomSpeed();
        }
    },

    //Get a random row to place the bug after each screen crossing
    getRandomRow: function() {
        var row = Math.floor((Math.random()  * 4 + 1));
        return (83 * row) - 18;
    },

    //Get a random speed for bugs after each screen crossing
    getRandomSpeed: function () {
        return 200 + Math.random() * 180;
    },

    // Draw the enemy on the screen, required method for game
    render: function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}



// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(skin) {
    this.sprite = skin,
    //Center Player as (canvas.width - image-width)/2
    this.x = (505 - 101)/2,
    this.y = 83*5 -18,
    this.lifes = 0,
    this.addLife(),
    this.addLife(),
    this.addLife()
    this.score = 0;
}

Player.prototype = {

    render: function () {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    },

    handleInput: function(key) {
        switch(key) {
            case 'left':
                if(this.x -101 >= 0) {
                    this.x -= 101;
                }
                break;
            case 'up':
                //-18 accounts for the offset from inital y coordinate
                if (this.y - 83 >= (83-18)) {
                    this.y -= 83;
                }
                break;
            case 'right':
                if(this.x + 101 <= 404) {
                    this.x += 101;
                }
                break;
            case 'down':
                if(this.y + 83 <= 435) {
                    this.y += 83;
                }
                break;
            default:
                return;
        }
    },

    //Check for collision between player and gem
    checkGemCollision: function() {
        //Axis-Aligned Bounding Box Algorithm
        if (this.x < gem.x + 101 &&
            this.x + 101 > gem.x &&
            //lower gem side overlaps upper player side
            this.y + (171 - 88) < gem.y + (171 - 5) &&
            //lower player side overlaps upper gem side
            this.y + (171 - 18) > gem.y + (171 - 112) + 24) {
                //Collision detected
                //Adjust score
                this.addToScore();
                document.getElementById('score').innerText = this.score.toString();
                //Generate new gem
                gem = new Gem(getRandomInt(1,3));
        }
    },

    //Check for collision between player and bug
    checkBugCollison: function() {
        //Loop over all bugs
        for(var i = 0; i < allEnemies.length; i++) {
            //Axis-Aligned Bounding Box Algorithm
            if(this.x < allEnemies[i].x + 50 &&
                this.x + 50 > allEnemies[i].x &&
                this.y + 120 < allEnemies[i].y + (171-18) &&
                this.y + (171-18) > allEnemies[i].y + 120) {
                    //Collision detected
                    //Reset player position
                    this.x = (505 - 101)/2;
                    this.y = 83*5 - 18;
                    //Remove a life
                    this.removeLife();
            }
        }
    },

    //Helper function
    update: function() {
        this.checkBugCollison();
        this.checkGemCollision();
    },

    //Adds to player score
    addToScore: function() {
        this.score += gem.points;
    },

    //Adds a life
    addLife() {
        //Add life to stats menu
        var parent = document.getElementById('lifes');
        var child = document.createElement('img');
            child.setAttribute('src','images/Heart.png'),
            child.setAttribute('width', '20');
            child.setAttribute('height', '34');
            parent.appendChild(child);
        //Increase player's internal life counter
        this.lifes++;
    },

    //Removes a life
    removeLife() {
        //Remove life from stats counter
        if(this.lifes > 0) {
            var parent = document.getElementById('lifes');
            var child = document.querySelector('#lifes img:last-child');
            parent.removeChild(child);
            this.lifes--;
        }
        //If dead -> game over
        if(this.lifes === 0) {
            gameOver();
        }
    }
}



var Gem = function(colorCode,x,y) {

    this.x = x || this.getRandomColumn();
    this.y = y || this.getRandomRow();

    switch(colorCode) {
        case 1:
            this.sprite = 'images/Gem Blue.png';
            this.points = 25;
            break;
        case 2:
            this.sprite = 'images/Gem Green.png';
            this.points = 50;
            break;
        case 3:
            this.sprite = 'images/Gem Orange.png';
            this.points = 100;
            break;
        default:
            this.sprite = 'images/Gem Blue.png';
            this.points = 25;
    }
}

Gem.prototype = {
    //Get a random row to place the gem
    getRandomRow: function() {
        var row = Math.floor((Math.random()  * (5 - 1) + 1));
        return (83 * row) - 28;
    },
    //Get a random column to place the gem
    getRandomColumn: function() {
        var column = Math.floor(Math.random() * 5);
        return  101 * column;
    },
    render: function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}



//Countdown to keep track of round
var Countdown = function(deadline, position) {
    this.deadline = deadline;
    this.position = document.getElementById(position);
    this.interval = this.start();
}

Countdown.prototype = {
    get: function() {
        return this.deadline;
    },
    //Initiates the countdown
    start: function() {
        //Place countdown in stats menu
        this.position.innerText = this.deadline;
        //Decrease counter by one every second
        var timeInterval = setInterval( function () {
            this.deadline--;
            //Highlight counter when nearing zero
            this.position.innerText = this.deadline;
            if(this.deadline === 3) {
                this.position.classList.add('high-time');
            }
            //End game if countdown is over
            if(this.deadline === 0) {
                this.position.classList.remove('high-time');
                clearInterval(timeInterval);
                gameOver();
            }
        }.bind(this), 1000);
        return timeInterval;
    }
}



// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
function gameStart() {
    //Reset score trackers
    document.getElementById('score').innerText = '0';
    document.getElementById('final-score').innerText = '0';

    allEnemies = [];
    function initEnemies(row) {
        bug = new Enemy({x:-101, y:(83 * row) -18});
        allEnemies.push(bug);
    }
    //Place desired number of bugs on the canvas
    var bugs = 4;
    for( var i = 1; i <= bugs; i++) {
        initEnemies(i);
    }
    player = new Player(skin);
    gem = new Gem(getRandomInt(1,3));
    countdown = new Countdown(20, 'timer');
}
//Initial start
gameStart();

//Stop Game and open menu when player runs out of time or lifes
function gameOver() {
    //Open game over menu
    document.getElementById('menu').className = 'open';
    //Add final score to game over menu
    document.getElementById('final-score').innerText = player.score.toString();
    //Reset displayed lifes in the stats menu
    while(player.lifes > 0) {
        player.removeLife();
    }
    //Prevents further execution of countdown interval
    clearInterval(countdown.interval);
}

//This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

//Get a random Int value between two values (inclusive max)
//Used for object placement on the canvas
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min +1)) + min;
}

//Add Event Handler to the New Game button
//to start a new game
document.getElementById('newGame').addEventListener('click', function() {
    gameStart();
    //Close game over menu
    document.getElementById('menu').className = 'close';
});

//Player Select
//Add Click Listeners to all player skin divs
Array.from(document.querySelectorAll('.player img')).forEach(function(item){
    item.addEventListener('click', function(e) {
        //Deselect previously selected player skin
        Array.from(document.querySelectorAll('.player')).forEach(function(el){
            if(el.classList.contains('border')) {
                el.classList.remove('border');
            }
        });
        //Select new player skin
        item.parentElement.classList.add('border');
        skin = item.getAttribute('src');
    });
});