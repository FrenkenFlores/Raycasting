const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

class Map {
	constructor() {
		this.grid = [
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
			[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
			[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
		];
	}
	isWall(x, y)
	{
		if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT)
			return (false);
		var gridIndexX = Math.floor(x / TILE_SIZE);
		var gridIndexY = Math.floor(y / TILE_SIZE);
		return (this.grid[gridIndexY][gridIndexX] == 1 ? false : true);
	}
	render() {
		for (var i = 0; i < MAP_NUM_ROWS; i++) {
			for (var j = 0; j < MAP_NUM_COLS; j++) {
				var tileX = j * TILE_SIZE; 
				var tileY = i * TILE_SIZE;
				var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
				stroke("#222");
				fill(tileColor);
				rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
			}
		}
	}
}

class Player {
	constructor()
	{
		this.x = WINDOW_WIDTH / 2;
		this.y = WINDOW_HEIGHT / 2;
		this.radius = 3;
		this.rotationAngel = Math.PI / 2;
		this.turnDirection = 0; // +1 : right, -1 : left
		this.walkDirection = 0; // +1 : forward, -1 : backward
		this.moveSpeed = 2.0;
		this.rotationSpeed = 2 * (Math.PI / 180);
	}
	update()
	{
		var newPositionX = this.x + this.walkDirection * this.moveSpeed * Math.cos(this.rotationAngel);
		var newPositionY = this.y + this.walkDirection * this.moveSpeed * Math.sin(this.rotationAngel);
		this.rotationAngel += this.turnDirection * this.rotationSpeed;
		if (grid.isWall(newPositionX, newPositionY) == true) {
			this.x = newPositionX;
			this.y = newPositionY;
		}
	}
	render()
	{
		noStroke();
		fill("green");
		circle(this.x, this.y, this.radius);
		stroke("red");
		line(this.x, this.y, this.x + Math.cos(this.rotationAngel) * 30, this.y + Math.sin(this.rotationAngel) * 30);
	}
}   

var grid = new Map();
var player = new Player();

function keyPressed()
{
	if (keyCode == UP_ARROW) {
		player.walkDirection = +1;
	} else if (keyCode == DOWN_ARROW) {
		player.walkDirection = -1;
	} else if (keyCode == RIGHT_ARROW) {
		player.turnDirection = +1;
	} else if (keyCode == LEFT_ARROW) {
		player.turnDirection = -1;
	}
}

function keyReleased()
{
	if (keyCode == UP_ARROW) {
		player.walkDirection = 0;
	} else if (keyCode == DOWN_ARROW) {
		player.walkDirection = 0;
	} else if (keyCode == RIGHT_ARROW) {
		player.turnDirection = 0;
	} else if (keyCode == LEFT_ARROW) {
		player.turnDirection = 0;
	}
}

function setup() {
	createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
		player.update();
}

function draw() {
	update();
	grid.render();
	player.render();
}
