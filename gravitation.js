////////////////////////////////////////////////////////////
// Global vars for mouse dragging while creating a new star
////////////////////////////////////////////////////////////

// Line coordinates
let xStart;
let yStart;
let xEnd;
let yEnd;

// Mousedown and mousedown times
let startTime;
let endTime;

// Global mouse info
let mouseX;
let mouseY;
let mousePressed = false;

////////////////////////////////////////////////////////////

// Array of stars
let stars = [];
let serial = 0;

// Animation constants
const trailSpeed = 200;
const animationStep = 0.1;
const animationDelay = 5;
const animationSmoothness = 0;
const screenWidth = 1880;
const screenHeight = 870;
const updateInterval = 20; // milliseconds for update when dragging mouse

// Display/styel constants
const Gcolor = "22"; // Green hex component for star RGB color

// Calculation constants
const initialSpeedDivider = 5;
const loss = 1; // 1 = no loss, < 1 = active loss
const maxMass = 5000000.0;
const G = 0.08; // Small: stars are weaker. Large: stars are gravitating stronger.

// Setting variables
var screenWalls = false;



// Initialize canvas, background and 'line'
var sampleSVG = d3.select("#viz")
    .append("svg")
    .attr("width", screenWidth)
    .attr("height", screenHeight); 
var line = sampleSVG.append("line")
    .style("stroke", "white")
    .attr("x1", 1)
    .attr("y1", 1)
    .attr("x2", 500)
    .attr("y2", 500);	
document.getElementById("walls").checked = screenWalls;
sampleSVG.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "black");

var line = sampleSVG.append("line")
    .style("stroke", "#002288")
	.style("stroke-width", 3)
    .attr("x1", 1)
    .attr("y1", 1)
    .attr("x2", 1)
    .attr("y2", 1);


// Drawing a line when mouse is dragging a new star

// Update status each X milliseconds, while the mouse is pressed
updatePressed = function() {
    if(mousePressed == true) {
        const curTime = new Date();
        const timeElapsed = curTime - startTime;      
        const curMass = Math.round(getMassFromTime(timeElapsed))
        const color = getColorFromMass(curMass);

        document.getElementById("infobox").innerHTML = 'Mass: ' + curMass;  
      
        line.attr("x1", xStart);
        line.attr("y1", yStart);
        line.attr("x2", mouseX);
        line.attr("y2", mouseY);
        line.style("stroke", color);
    } else {
        line.attr("x1", 1);
        line.attr("y1", 1);
        line.attr("x2", 1);
        line.attr("y2", 1);
        line.style("stroke", "#002288");
    }		
};

// Mouse down - start drawing a line
sampleSVG.on('mousedown', function() {
	mousePressed = true;
	xStart = d3.mouse(this)[0];
	yStart = d3.mouse(this)[1];
	document.getElementById("infobox").innerHTML = "0";
    startTime = new Date();
    window.setInterval(updatePressed, updateInterval);
});    
// Mouse move - update the line coordinates & color
sampleSVG.on('mousemove', function() {
    mouseX = d3.mouse(this)[0];
    mouseY = d3.mouse(this)[1];	
});
// Mouse up: 
sampleSVG.on('mouseup',function(d) {
    window.clearInterval();
	endTime = new Date();
	xEnd = d3.mouse(this)[0];
	yEnd = d3.mouse(this)[1];
	mousePressed = false;
	xSpeed = getSpeed(xStart, xEnd);
	ySpeed = getSpeed(yStart, yEnd);
	mass = getMassFromTime(endTime - startTime);
	serial += 1;
	var radius = getRadiusFromMass(mass);
	if(radius < 4) { radius = 4; }
	var contour = radius * 0.3;
    var contourColor = getColorFromMass(mass);
    
	var newCircle = sampleSVG.append("circle")
	.style("stroke", contourColor)
	.style("fill", "white")
	.style("stroke-width", contour)
	.style("opacity", 0.7)
	.attr("r",  radius)
	.attr("cx", xStart)
	.attr("cy", yStart)
	.attr("speed_x", xSpeed)
	.attr("speed_y", ySpeed)
	.attr("serial", serial)
	.attr("mass", mass)
		.transition()            
		.delay(0)            
		.duration(100)
		.each("end", animateFirstStep);
});
	

// Calculate star color according to its mass (styling)
function getColorFromMass(mass) {	

    // Auxiliary for calculation	
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.padStart(2, '0');
    }
				
	let Rcolor = mass / maxMass;			
	Rcolor = Math.round(Rcolor * 256);		
	let Bcolor = Math.floor((256 - Rcolor) / 2);
			
	Rcolor = componentToHex(Rcolor);
	Bcolor = componentToHex(Bcolor);			
			
	const color = "#" + Rcolor + Gcolor + Bcolor;
	
	return color;
}
	

// Generic function to calculate mass from time elapsed from mousedown. TODO: Currently disabled
function getMassFromTime(time) {
	let mass = Math.pow(time, 2) / 10;
	if(mass > maxMass) {
		mass = maxMass;
	}
	return mass;
}


// Generic function to calculate radius of the star from the mass
function getRadiusFromMass(mass) {
	return Math.cbrt(mass)/2;
}

	
function animateFirstStep(){
	stars.push(this);
	
    d3.select(this)
      .transition()            
        .delay(0)            
        .duration(0)
        .each("end", waitAnimation);
};

function waitAnimation(){
	var cx = d3.select(this).attr("cx");
	var cy = d3.select(this).attr("cy");
	var r = d3.select(this).attr("r");

	var speed_x = d3.select(this).attr("speed_x");
	var speed_y = d3.select(this).attr("speed_y");	
	
	speed_x = +speed_x;
	speed_y = +speed_y;
	
	var speed_size = Math.sqrt(Math.pow(speed_x, 2) + Math.pow(speed_y, 2));
	
	if(speed_size > trailSpeed) { speed_size = trailSpeed; }
	var opacity = speed_size / trailSpeed * 0.2;
	
	sampleSVG.append("circle")
		.style("stroke", "black")
		.style("stroke-opacity", 0.0)
		.style("fill", "#999999")
		.attr("r", r)
		.attr("cx", cx)
		.attr("cy", cy)
		.style('opacity', opacity)
      .transition()
		.delay(0)
		.duration(1000)
		.style('opacity', 0)
		.each("end", selfKill);
	
		
    d3.select(this)
      .transition()
		.delay(0)
        .duration(0)
		.each("end", updateLocation);
};
function selfKill() {
    d3.select(this)
		.remove();
};
// Calc acceleration for [x,y] imposed to a passive star by an active star
function calcAcc(mass_pas, x_pas, y_pas, mass_act, x_act, y_act) {
	var x_dist = x_pas - x_act;
	var y_dist = y_pas - y_act;
	var dist = Math.sqrt(Math.pow(x_dist, 2) + Math.pow(y_dist, 2));
	
	// Gravitational force size
	var force = G * mass_pas * mass_act / Math.pow(dist, 2);
	
	// Calculate [x,y] components of the force
	var m = Math.abs(x_dist / y_dist);
	var y_force = force / (Math.sqrt(m*m+1));
	var x_force = y_force * m;
	
	// Determine force sign
	if(x_pas > x_act) {
		x_force = -x_force;
	}
	
	if(y_pas > y_act) {
		y_force = -y_force;
	}
	
	// Apply: a  = F / m
	x_acc = x_force / mass_pas;
	y_acc = y_force / mass_pas;
	
	return [x_acc, y_acc];
	
	
}
    
// Update star location by applying forces onto it
function updateLocation() {
	
	
	// Get current star attributes
	var star_x = d3.select(this).attr("cx");
	var star_y = d3.select(this).attr("cy");
	var speed_x = d3.select(this).attr("speed_x");
	var speed_y = d3.select(this).attr("speed_y");	
	var serial = d3.select(this).attr("serial");
	var r = d3.select(this).attr("r");
	var mass = d3.select(this).attr("mass");
	
	star_x = +star_x;
	star_y = +star_y;
	speed_x = +speed_x;
	speed_y = +speed_y;
	serial = +serial;
	r = +r;
	mass = +mass;
	
	// Apply previous step
	star_x += speed_x*animationStep;
	star_y += speed_y*animationStep;
	
	if(screenWalls) {
		if(star_x < 0 || star_x > screenWidth) {			
			speed_x = -speed_x;
		}
		if(star_y < 0 || star_y > screenHeight) {			
			speed_y = -speed_y;
		}
	}
	
	// Get force applied by other stars
	stars.forEach(function(element) {
		var activeX = d3.select(element).attr("cx");
		var activeY = d3.select(element).attr("cy");
		var activeMass = d3.select(element).attr("mass");
		var activeSerial = d3.select(element).attr("serial");
		var activeR = d3.select(element).attr("r");
		
		activeR = +activeR;
		activeX = +activeX;
		activeY = +activeY;
		activeMass = +activeMass;
		
		var dist = Math.sqrt(Math.pow((activeX - star_x), 2) + Math.pow((activeY - star_y), 2));	
		
		speed_x *= loss;
		speed_y *= loss;
		if((serial != activeSerial) && (dist > 1.0)) { // Avoid applying force from same star, or from very very close star
			var forces = calcAcc(mass, star_x, star_y, activeMass, activeX, activeY);
			speed_x += forces[0];
			speed_y += forces[1];
		}
	});
	
	// Set new speed
	d3.select(this)
		.attr("speed_x", speed_x)
		.attr("speed_y", speed_y);
	
	// Set new location
    d3.select(this)
      .transition()
		.delay(animationDelay)
		.duration(animationSmoothness)
        .attr("cx", star_x)
		.attr("cy", star_y)
		.each("end", waitAnimation); // Next step
}


	
// TODO: Use this
function displayStarInfo() {
	var cx = d3.select(this).attr("cx");
	var cy = d3.select(this).attr("cy");
	var r = d3.select(this).attr("r");
	var serial = d3.select(this).attr("serial");
	var mass = d3.select(this).attr("mass");	
	var speed_x = d3.select(this).attr("speed_x");
	var speed_y = d3.select(this).attr("speed_y");	
	
	mass = Math.round(mass);
	cx = Math.round(cx);
	cy = Math.round(cy);
	r = Math.round(r);
	speed_x = Math.round(speed_x);
	speed_y = Math.round(speed_y);
	
	var output = "Star #" + serial + ", Mass: " + mass + ", R: " + r + ", (x, y) = " + cx + ", " + cy + "         (speed_x, speed, y) = " + speed_x + ", " + speed_y;
	
	document.getElementById("infobox").innerHTML = output;
}

function wallsClick() {
	var walls = document.getElementById("walls").checked;
	document.getElementById("infobox").innerHTML = 'Walls: ' + walls;

	screenWalls = walls;
}

// Calculate initial speed of stars
function getSpeed(start, end) {
    return (end - start) / initialSpeedDivider;
}