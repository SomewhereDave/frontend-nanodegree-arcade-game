let allEnemies = [],
    player,
    enemy,
    countdown;

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
        var row = Math.floor((Math.random()  * (4 - 1) + 1));
        return (83 * row) - 18;
    },

    //Get a random speed for bugs after each screen crossing
    getRandomSpeed: function () {
        return 200 + Math.random() * 100;
    },

    // Draw the enemy on the screen, required method for game
    render: function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}



// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(lifes) {
    this.sprite = 'images/char-boy.png',
    //Center Player as (canvas.width - image-width)/2
    this.x = (505 - 101)/2,
    this.y = 83*5 -18,
    this.lifes = 0,
    this.addLife(),
    this.addLife(),
    this.addLife()
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

    checkCollison: function() {
        //Check for collision with bug
        for(var i = 0; i < allEnemies.length; i++) {

            if(this.x < allEnemies[i].x + 50 &&
                this.x + 50 > allEnemies[i].x &&
                this.y + 120 < allEnemies[i].y + (171-18) &&
                this.y + (171-18) > allEnemies[i].y + 120
            ) {
                this.x = (505 - 101)/2;
                this.y = 83*5 - 18;
                this.removeLife();
            }
        }
    },

    update: function() {
        this.checkCollison();
    },

    addLife() {
        if(this.lifes < 5) {
        var parent = document.getElementById('lifes');
            var child = document.createElement('img');
            child.setAttribute('src','images/Heart.png'),
            child.setAttribute('width', '20');
            child.setAttribute('height', '34');
            parent.appendChild(child);
            this.lifes++;
        }
    },

    removeLife() {
        var parent = document.getElementById('lifes');
        var child = document.querySelector('#lifes img:last-child');
        parent.removeChild(child);
        this.lifes--;
        if(this.lifes === 0) {
            gameOver();
        }
    }
}



var Gem = function(color) {

    this.x = 0;
    this.y = 0;

    switch(color) {
        case 'blue':
            this.sprite = 'images/Gem Blue.png';
            this.points = 25;
            break;
        case 'green':
            this.sprite = 'images/Gem Green.png';
            this.points = 50;
            break;
        case 'orange':
            this.sprite = 'images/Gem Orange.png';
            this.points = 100;
            break;
        default:
    }
}



//Countdown to keep track of round
var Countdown = function(deadline, placement) {
    this.deadline = deadline;
    this.placement = document.getElementById(placement);
    this.interval = this.start();
}

Countdown.prototype = {
    get: function() {
        return this.deadline;
    },
    start: function() {
        this.placement.innerText = this.deadline;
        var self = this;
        var timeInterval = setInterval( function () {
            self.deadline--;
            self.placement.innerText = self.deadline;
            if(self.deadline === 3) {
                self.placement.className = 'highTime';
            }
            if(self.deadline === 0) {
                self.placement.className = '';
                clearInterval(timeInterval);
                gameOver();
            }
        }, 1000);
        return timeInterval;
    },
    add: function(seconds) {
        this.deadline += seconds;
    }
}



// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
function gameStart() {
    allEnemies = [];
    function initEnemies(row) {
        bug = new Enemy({x:-101,y:(83 * row) -18});
        allEnemies.push(bug);
    }
    for( var i = 1; i <= 3; i++) {
        initEnemies(i);
    }
    player = new Player();
    countdown = new Countdown(20, 'timer');
}
//Initial start
gameStart();

//Stop Game and open menu
//if player runs out of time or lifes
function gameOver() {
    document.getElementById('menu').className = 'open';
    while(player.lifes > 0) {
        player.removeLife();
    }
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

//Add Event Handler to the New Game button
//to start a new game
    document.getElementById('newGame').addEventListener('click', function() {
        gameStart();
        document.getElementById('menu').className = 'close';
    });