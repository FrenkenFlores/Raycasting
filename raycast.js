const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);
const WALL_STRIP_WIDTH = 20;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

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

class Ray {
	constructor(rayAngle){
		this.angle = normalizeAngel(rayAngle);
		this.wallHitX = 0;
		this.wallHitY = 0;
		this.distance = 0;
		this.pointDown = this.angle > 0 && this.angle < Math.PI;
		this.pointUp = !this.pointDown;
		this.pointLeft = this.angle > Math.PI / 2 && this.angle < (Math.PI * 3) / 2;
		this.pointRight = !this.pointLeft;
	}
	cast(columnId) {
//		console.log(">", this.pointRight); //check
//		console.log("V", this.pointDown);
		var xstep;
		var ystep;	// delta y and delta z
		var xintercept;	// closest interception with the grid
		var yintercept;
		// Find the y-coordinate of the closest horizontal grid intersenction
		yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE; // 64.45 -> 2.0140 -> 2 -> 2 * 32 -> 64
		yintercept += this.pointDown ? 32 : 0; // increase by 32 if ray points down
		// Find the x-coordinate of the closest horizontal grid intersection
		xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);
		ystep = TILE_SIZE;
		ystep *= this.pointUp ? -1 : 1; // increment or decrement
		xstep = ystep / Math.tan(this.angle);
		xstep *= this.pointRight ? -1 : 1;
	}
	render() {
		stroke("grey");
		line(player.x, player.y, player.x + Math.cos(this.angle) * 30, player.y + Math.sin(this.angle) * 30);
	}
}

var grid = new Map();
var player = new Player();
var rays = [];

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

function normalizeAngel(angle) {
	angle = angle % (2 * Math.PI);
	if (angle < 0)
		angle = angle + (2 * Math.PI);
	return (angle);
}

function setup() {
	createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function castRays() {
	var columnId;
	var rayAngle = player.rotationAngel - (FOV_ANGLE / 2);
	rays = [];
	for (columnId = 0; columnId < NUM_RAYS; columnId++)
	{
		var ray = new Ray(rayAngle);
		ray.cast(columnId);
		rays.push(ray);
		rayAngle += FOV_ANGLE / NUM_RAYS;
	}

}

function update() {
		player.update();
		castRays();
}

function draw() {
	update();
	grid.render();
	for (ray of rays)
		ray.render();
	player.render();
}
