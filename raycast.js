const TILE_SIZE = 62;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);
const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;
const MAP_SCALE = 0.2;

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
				var tileColor = this.grid[i][j] == 1 ? "rgba(123, 96, 154, 1)" : "rgba(220, 189, 255, 1)";
//				stroke("#222");
				fill(tileColor);
				rect(MAP_SCALE * tileX, MAP_SCALE * tileY, MAP_SCALE * TILE_SIZE, MAP_SCALE * TILE_SIZE);
			}
		}
	}
}

class Player {
	constructor()
	{
		this.x = WINDOW_WIDTH / 2;
		this.y = WINDOW_HEIGHT / 2;
		this.radius = 30;
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
		fill("rgba(112, 80, 149, 1)");
		circle(MAP_SCALE * this.x, MAP_SCALE * this.y, MAP_SCALE * this.radius);
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
		this.rayHitVertWall = false;
	}
	cast() {
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
		// Increment xstep and ystep until we find a wall
		while (foundHorWallHit == false) {
			if (grid.isWall(nextHorzTouchX, nextHorzTouchY - (this.pointUp ? 1 : 0))) {
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
		// Increment xstep and ystep until we find a wall
		while (foundVertWallHit == false) {
			if (grid.isWall(nextVertTouchX - (this.pointLeft ? 1 : 0), nextVertTouchY)) {
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
	this.rayHitVertWall = (vertHitDistance < horHitDistance) ? true : false;
	}

	/////////////////////////////////////   xstep && ystep	 //////////////////////////////
	// tan(a)
	//		 -Y         					 -Y  				 	    	 -Y			
	//		- | -					 		+ | -		 					- | +
	//	-X ---0--- X <=   for y  <=     -X ---0--- X	=>   for x	=> 	-X ---0--- X
	//		+ | +							- | +							- | +
	//		  Y  				      	   	  Y                     		  Y
	//////////////////////////////////////////////////////////////////////////////////////
	render() {
		stroke("rgba(166, 130, 206, 0.77)");
		line(MAP_SCALE * player.x, MAP_SCALE * player.y, MAP_SCALE * this.wallHitX, MAP_SCALE * this.wallHitY);
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
		ray.cast();
		rays.push(ray);
		rayAngle += FOV_ANGLE / NUM_RAYS;
	}

}
function renderCeiling() {
    noStroke();
    fill('rgba(241, 233, 246, 1)');
    rect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT/2);
}

function renderFloor() {
    noStroke();
    fill('rgba(86, 65, 98, 1)');
    rect(0, WINDOW_HEIGHT/2, WINDOW_WIDTH, WINDOW_HEIGHT)
}

function render3DWall() {
	for (var i = 0; i < NUM_RAYS; i++) {
		var ray = rays[i];
		var perpendicularDistance = ray.distance * Math.cos(ray.angle - player.rotationAngel);
		var distanceToProjection = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2);
		var wallStripHeight = (TILE_SIZE / perpendicularDistance) * distanceToProjection;
		var alpha = 1;
		var colorR = (ray.rayHitVertWall ? 236 : 206); 
		var colorG = (ray.rayHitVertWall ? 219 : 191);
		var colorB = (ray.rayHitVertWall ? 255 : 227);
		noStroke();
		fill("rgba("+ colorR +", "+ colorG +", "+ colorB +", "+ alpha +")");
		rect(i * WALL_STRIP_WIDTH, (WINDOW_HEIGHT / 2) - (wallStripHeight / 2), WALL_STRIP_WIDTH, wallStripHeight);
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
	clear();
	background("rgba(195, 179, 214, 1)");
	update();
	renderCeiling();
    renderFloor();
	render3DWall();
	grid.render();
	for (ray of rays)
		ray.render();
	player.render();
}
