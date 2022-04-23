const POP_COUNT = 200;
const agents = [];
const ANIMATION_LENGTH = 350;
const FRAMES_PER_GENE = 10;
const MOUSE_WIDTH = 0.5;
const MOUSE_SIZE = 50;
const MOUSE_SPEED = 0.05;
const target = [800, 250];
const obstacles = [];
let matingPool = [];
let frameIndex = 0;
const startButton = [0, 0];
let isClicked = false;

function setup(){
	window.addEventListener('click', mouseClick);
	createAgents();
	createCanvas(800, 500);
	strokeWeight(2);
}

function draw(){
	clear();
	background(color(200, 200, 200));
	runSimulationFrame();
	frameIndex++;
	if(frameIndex > ANIMATION_LENGTH){
		calcPopFitness();
		createMatingPool();
		generate();
		resetSimulation();
	}
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

function mouseClick(e){
	if(!isClicked) {
		startButton[0] = e.clientX;
		startButton[1] = e.clientY;
		isClicked = true;
	}else{
		const box = makeBox(startButton[0], startButton[1], e.clientX, e.clientY);
		obstacles.push(box);
		isClicked = false;
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

function mutate(agent){
	for(let i = 0; i < agent.genes.length; i++){
		if(floor(random(0, 40)) == 7){
			if(random() > 0.5){
				agent.genes[i] = 'L';
			}else{
				agent.genes[i] = 'R';
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
	agents.forEach(agent => {
		if(agent.fitness > highest){
			highest = agent.fitness;
		}
	});

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
	return 1/h;
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
			x: 10,
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
	agents.forEach(agent => {
		drawAgent(agent);
	});
	obstacles.forEach(box => {
		drawBox(box);
	});
	moveAgents();
}

function drawBox(box){
	rect(box.x, box.y, box.width, box.height);
}

function isPointInBox(x, y){
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