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
			return (true);
		var gridIndexX = Math.floor(x / TILE_SIZE);
		var gridIndexY = Math.floor(y / TILE_SIZE);
		return this.grid[gridIndexY][gridIndexX] != 0 ? true : false;
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
		if (grid.isWall(newPositionX, newPositionY) == false) {
			this.x = newPositionX;
			this.y = newPositionY;
		}
	}
	render()
	{
		noStroke();
		fill("green");
		circle(this.x, this.y, this.radius);
	//	stroke("red");
	//	line(this.x, this.y, this.x + Math.cos(this.rotationAngel) * 30, this.y + Math.sin(this.rotationAngel) * 30);
	}
}   

class Ray {
	constructor(rayAngle){
		this.angle = normalizeAngle(rayAngle);
		this.wallHitX = 0;
		this.wallHitY = 0;
		this.distance = 0;
		this.pointDown = this.angle > 0 && this.angle < Math.PI;
		this.pointUp = !this.pointDown;
		this.pointLeft = this.angle > Math.PI / 2 && this.angle < (Math.PI * 3) / 2;
		this.pointRight = !this.pointLeft;
	}
	cast(columnId) {
		var foundHorWallHit = false;
		var foundVertWallHit = false;
		var xstep;
		var ystep;	// delta y and delta z
		var xintercept;	// closest interception with the grid
		var yintercept;
		// Find the y-coordinate of the closest horizontal grid intersenction
		yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE; // 64.45 -> 2.0140 -> 2 -> 2 * 32 -> 64
		yintercept += this.pointDown ? TILE_SIZE : 0; // increase by 32 if ray points down
		// Find the x-coordinate of the closest horizontal grid intersection
		xintercept = player.x + (yintercept - player.y) / Math.tan(this.angle);
		ystep = TILE_SIZE;
		ystep *= this.pointUp ? -1 : 1; // increment or decrement

		xstep = TILE_SIZE / Math.tan(this.angle);
        xstep *= (this.pointLeft && xstep > 0) ? -1 : 1; // +x -> -x if ray points up and left
        xstep *= (this.pointRight && xstep < 0) ? -1 : 1; // -x -> +x if ray points up and right

		var nextHorzTouchX = xintercept;
		var nextHorzTouchY = yintercept;
		var horWallHitX = 0;
		var horWallHitY = 0;

      if (this.pointUp)
          nextHorzTouchY -= 1;
		// Increment xstep and ystep until we find a wall
        while (foundHorWallHit == false) {
            if (grid.isWall(nextHorzTouchX, nextHorzTouchY)) {
                foundHorWallHit = true;
                horWallHitX = nextHorzTouchX;
                horWallHitY = nextHorzTouchY;
                break;
            } else {
                nextHorzTouchX += xstep;
                nextHorzTouchY += ystep;
            }
		}
		// Find the x-coordinate of the closest vertical grid intersenction
		xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE; // if a is a float value, floor(a) will take the minimal integer value 
		xintercept += this.pointRight ? TILE_SIZE : 0; // increase by 32 if ray points down
		// Find the y-coordinate of the closest vertical grid intersection
		yintercept = player.y + (xintercept - player.x) * Math.tan(this.angle);
		
		xstep = TILE_SIZE;
		xstep *= this.pointLeft ? -1 : 1; // increment or decrement
		ystep = TILE_SIZE * Math.tan(this.angle);
        ystep *= (this.pointUp && ystep > 0) ? -1 : 1; // +y -> -y if the ray points up and right (go up)
        ystep *= (this.pointDown && ystep < 0) ? -1 : 1; // -y -> y if the ray points down and left (go down)

		var nextVertTouchX = xintercept;
		var nextVertTouchY = yintercept;
		var vertWallHitX = 0;
		var vertWallHitY = 0;

      if (this.pointLeft)
          nextVertTouchX -= 1;
		// Increment xstep and ystep until we find a wall
        while (foundVertWallHit == false) {
            if (grid.isWall(nextVertTouchX, nextVertTouchY)) {
                foundVertWallHit = true;
                vertWallHitX = nextVertTouchX;
                vertWallHitY = nextVertTouchY;
                break;
            } else {
                nextVertTouchX += xstep;
                nextVertTouchY += ystep;
            }
		}
	// claculate the vertical and the horizontal hit distancise and choose the shortest
	var horHitDistance = (foundHorWallHit) ? calculateDistance(player.x, player.y, horWallHitX, horWallHitY) : Number.MAX_VALUE;
	var vertHitDistance = (foundVertWallHit) ? calculateDistance(player.x, player.y, vertWallHitX, vertWallHitY) : Number.MAX_VALUE;
	this.wallHitX = (horHitDistance < vertHitDistance) ? horWallHitX : vertWallHitX;
	this.wallHitY = (horHitDistance < vertHitDistance) ? horWallHitY : vertWallHitY;
	this.distance = (horHitDistance < vertHitDistance) ? horHitDistance : vertHitDistance;
	}

	///////////////////////////////////// 107-111 && 136-142 //////////////////////////////
	// tan(a)
	//		 -Y         					 -Y  				 	    	 -Y			
	//		- | -					 		+ | -		 					- | +
	//	-X ---0--- X <=   for y  <=     -X ---0--- X	=>   for x	=> 	-X ---0--- X
	//		+ | +							- | +							- | +
	//		  Y  				      	   	  Y                     		  Y
	//////////////////////////////////////////////////////////////////////////////////////
	render() {
		stroke("purple");
		line(player.x, player.y, this.wallHitX, this.wallHitY);
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

function normalizeAngle(angle) {
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

function calculateDistance(x1, y1, x2, y2) {
	return (Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)));
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
