const POP_COUNT = 200;
const agents = [];
const ANIMATION_LENGTH = 350;
const FRAMES_PER_GENE = 10;
const MOUSE_WIDTH = 0.5;
const MOUSE_SIZE = 50;
const MOUSE_SPEED = 0.1;
const target = [1200, 250];
const obstacles = [];
let matingPool = [];
let frameIndex = 0;
const startButton = [0, 0];
let secondClick = false;
let averageFitness;

function setup(){
	createAgents();
	createCanvas(1200, 500);
	addDocElements();
}

function draw(){
	clear();
	background(color(200, 200, 200));
	runSimulationFrame();
	frameIndex++;
	if(frameIndex > ANIMATION_LENGTH || allStuck()){
		calcPopFitness();
		createMatingPool();
		generate();
		resetSimulation();
	}
}

function allStuck(){
	for(let i = 0; i < agents.length; i++){
		if(!agents[i].stuck){
			return false;
		}
	}
	return true;
}

function makeBox(x1, y1, x2, y2){
	const x = x1 < x2 ? x1 : x2;
	const y = y1 < y2 ? y1 : y2;
	const width = Math.abs(x2 - x1);
	const height = Math.abs(y2 - y1);
	return {
		x, y, width, height
	};
}

function mouseClicked(){
	if(!secondClick) {
		startButton[0] = mouseX;
		startButton[1] = mouseY;
		secondClick = true;
	}else{
		const box = makeBox(startButton[0], startButton[1], mouseX, mouseY);
		obstacles.push(box);
		secondClick = false;
	}
}

function crossover(a, b){
	let outputGenes = '';
	for(let i = 0; i < a.length; i++){
		if(i > a.length/2){
			outputGenes += a[i];
		}else{
			outputGenes += b[i];
		}
	}
	return outputGenes;
}

function replaceAtIndex(str, i, c){
	return str.substring(0, i) + c + str.substring(i + 1);
}

function mutate(agent){
	for(let i = 0; i < agent.genes.length; i++){
		if(floor(random(0, 500)) == 10){ // 1% chance of mutation
			if(random() > 0.5){
				agent.genes = replaceAtIndex(agent.genes, i, 'L');
			}else{
				agent.genes = replaceAtIndex(agent.genes, i, 'R');
			}
		}
	}
}

function generate(){
	agents.forEach(agent => {
		const a = matingPool[floor(random(matingPool.length))];
		const b = matingPool[floor(random(matingPool.length))];
		agent.genes = crossover(a, b);
		mutate(agent);
	});
}

function createMatingPool(){
	matingPool = [];
	let highest = 0;
	let fit = 0;
	agents.forEach(agent => {
		if(agent.fitness > highest){
			highest = agent.fitness;
			fit += agent.fitness;
		}
	});
	fit /= agents.length;
	averageFitness.innerText = fit;

	agents.forEach(agent => {
		const normalizedFitness = agent.fitness / highest;
		const nAddElements = floor(normalizedFitness * 100);
		for(let i = 0; i < nAddElements; i++){
			matingPool.push(agent.genes);
		}
	});
}

function calcFitness(agent){
	const a = target[0] - agent.x;
	const b = target[1] - agent.y;
	const h = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
	return 2000 - h;
}

function calcPopFitness(){
	agents.forEach(agent => {
		const fitness = calcFitness(agent);
		agent.fitness = fitness;
	});
}

function resetSimulation(){
	agents.forEach(agent => {
		agent.x = 10;
		agent.y = 250;
		agent.rotation = 0.01;
		agent.stuck = 0;
		agent.fitness = 0;
	});
	frameIndex = 0;
}

function createRandomGenes(){
	let genes = "";
	const numGenes = ANIMATION_LENGTH / FRAMES_PER_GENE;
	for(let i = 0; i < numGenes; i++){
		if(random() > 0.5){
			genes += 'L';
		}else{
			genes += 'R';
		}
	}
	return genes;
}

function createAgents(){
	for(let i = 0; i < POP_COUNT; i++){
		const agent = {
			x: 0,
			y: 250,
			rotation: 0.01,
			genes: createRandomGenes(),
			fitness: 0,
			stuck: false
		};

		agents.push(agent);
	}
}

function runSimulationFrame(){
	stroke(color(0));
	strokeWeight(2);
	agents.forEach(agent => {
		drawAgent(agent);
	});
	obstacles.forEach(box => {
		drawBox(box);
	});
	if(secondClick){
		stroke(color(255, 0, 0));
		strokeWeight(5);
		point(startButton[0], startButton[1]);

		stroke(color(0, 255, 0, 50));
		const box = makeBox(startButton[0], startButton[1], mouseX, mouseY);
		rect(box.x, box.y, box.width, box.height);
	}
	stroke(color(0, 255, 0));
	strokeWeight(5);
	circle(1190, 250, 20);
	moveAgents();
}

function drawBox(box){
	rect(box.x, box.y, box.width, box.height);
}

function isPointInBox(x, y){
	if(x < 0 || x > 1200 || y < 0 || y > 500){
		return true;
	}
	for(let i = 0; i < obstacles.length; i++){
		const box = obstacles[i];
		if(!(x < box.x || x > box.x + box.width || y < box.y || y > box.y + box.height)){
			return true;
		}
	}
	return false;
}

function moveAgents(){
	agents.forEach(agent => {
		points = calcPoints(agent.rotation);
		if(isPointInBox(agent.x + points.x, agent.y + points.y)){
			agent.stuck = true;
		}
		if(!agent.stuck){
			const geneIndex = floor(frameIndex / FRAMES_PER_GENE);
			if(agent.genes[geneIndex] == 'L'){
				agent.rotation += 0.03;
			}else{
				agent.rotation -= 0.03;

			}
			agent.x += points.x / (1/MOUSE_SPEED);
			agent.y += points.y / (1/MOUSE_SPEED);
		}
	});
}

function drawAgent(agent){
	const result = calcPoints(agent.rotation);
	result.x += agent.x;
	result.y += agent.y;
	result.p1[0] += agent.x;
	result.p1[1] += agent.y;
	result.p2[0] += agent.x;
	result.p2[1] += agent.y;

	line(result.p1[0], result.p1[1], result.x, result.y);
	line(result.p2[0], result.p2[1], result.x, result.y);
	line(result.p1[0], result.p1[1], result.p2[0], result.p2[1]);
}

function normalize(x, y){
	let h = Math.pow(x, 2) + Math.pow(y, 2);
	h = Math.sqrt(h);
	return [x/h, y/h];
}

function calcPoints(rotation){
	const o = Math.sin(rotation) * MOUSE_SIZE;
	const a = Math.cos(rotation) * MOUSE_SIZE;
	const perpendicularSlope = -(a / o);
	const perpLine = normalize(1, perpendicularSlope);
	const p1 = [perpLine[0] * (MOUSE_WIDTH / 2), perpLine[1] * (MOUSE_WIDTH / 2)];
	const p2 = [perpLine[0] * -(MOUSE_WIDTH / 2), perpLine[1] * -(MOUSE_WIDTH / 2)];
	p1[0] *= MOUSE_SIZE;
	p1[1] *= MOUSE_SIZE;
	p2[0] *= MOUSE_SIZE;
	p2[1] *= MOUSE_SIZE;
	return {
		x: a,
		y: o,
		p1,
		p2
	};
}

function addDocElements(){
	const description = document.createElement('p');
	description.innerText = 'Use the mouse to create obstascles. Watch the agents learn the path to the green dot';
	document.body.appendChild(description);
	averageFitness = document.createElement('span');
	const fitnessLabel = document.createElement('p');
	fitnessLabel.innerText = 'Average Fitness: ';
	fitnessLabel.appendChild(averageFitness);
	document.body.appendChild(fitnessLabel);
}