const PIXI = require('pixi.js');

var Container = PIXI.Container;
var autoDetectRenderer = PIXI.autoDetectRenderer;

var pokeball, pokemons;
var state;

var stage = new Container();
var maxWidth = 512;
var maxHeight = 512;
var maxSpeed = -0.07;
var renderer = autoDetectRenderer(maxWidth, maxHeight, {transparent: true});
document.body.appendChild(renderer.view);

state = play;

setup();
requestAnimationFrame(gameLoop);

// Game States
function menu (ts) {

}
function play (ts) {
    pokeball.update(ts);
    pokeball.inertia(ts);
    
    if(this.startTime == null) this.startTime = ts;
    var dt = (ts - this.startTime)/700;
    this.startTime = ts;

    pokemons.update(dt);

    if (pokeball.position.y > maxHeight) pokeball.reset();
    if (pokeball.position.x > maxWidth || pokeball.position.x < 0) pokeball.reset();
}
function end (ts) {

}

// Game Setup
function setup () {
  var pokemonTexture = PIXI.Texture.fromImage('pokemons.png');
  pokemonTexture.frame = new PIXI.Rectangle(0, 0, 100, 100);
  pokemons = createPokemon(pokemonTexture);

  var pokeballTexture = PIXI.Texture.fromImage('pokeball.png');
  pokeball = createPokeball(pokeballTexture);
}
function createPokeball(texture) {
  pokeball = new PIXI.Sprite(texture);

  // Initialize variables
  var x = maxWidth / 2;
  var y = maxHeight - 30;

  pokeball.width = 30;
  pokeball.height = 30;
  pokeball.interactive = true;
  pokeball.buttonMode = true;
  pokeball.anchor.set(0.5);

  pokeball.position.set(x, y);
  pokeball.origX = x;
  pokeball.origY = y;
  pokeball.speedX = 0.0;
  pokeball.speedY = 0.0;
  pokeball.difX = 0.0;
  pokeball.difY = 0.0;
  pokeball.thrown = false;

  pokeball.update = function(dt) {
    if (!pokeball.dragging) return;
    if (pokeball.startTime==null) pokeball.startTime = dt;
    pokeball.delta = dt - pokeball.startTime;
    pokeball.speedX = pokeball.difX / (pokeball.delta);
    pokeball.speedY = pokeball.difY / (pokeball.delta);
  };
  pokeball.inertia = function(dt) {
    if(pokeball.thrown) {
      if (pokeball.speedY==0) return pokeball.reset();
      pokeball.speedY =(maxSpeed > pokeball.speedY) ? maxSpeed : pokeball.speedY;
      pokeball.position.x = pokeball.position.x + pokeball.speedX*pokeball.delta;
      pokeball.position.y = pokeball.position.y + pokeball.speedY*pokeball.delta;
      // TODO: Im sorry bro, this doesnt work properly and fks the pokeball later 
      // I know. -.-
      //pokeball.scale.set( pokeball.scale.x- 0.0000001*pokeball.delta);
      pokeball.speedY = pokeball.speedY + 0.000581;
    }
  };
  pokeball.reset = function () {
    pokeball.thrown = false;
    pokeball.position.x = pokeball.origX;
    pokeball.position.y = pokeball.origY;
    pokeball.startTime = null;
  };

  // Events Setup
  pokeball
    // events for drag start
      .on('mousedown', onDragStart)
      .on('touchstart', onDragStart)
    // events for drag end
      .on('mouseup', onDragEnd)
      .on('mouseupoutside', onDragEnd)
      .on('touchend', onDragEnd)
      .on('touchendoutside', onDragEnd)
    // events for drag move
      .on('mousemove', onDragMove)
      .on('touchmove', onDragMove);

  // add it to the stage
  stage.addChild(pokeball);
  return pokeball;
}
function createPokemon (texture) {
  var pokemon = new PIXI.Sprite(texture);
  pokemon.angle = 0;
  pokemon.position.set(50, 50);
  pokemon.update = function (dt) {
    this.angle += 0.6*dt;
    var middle = (maxWidth / 2 - 50);
    var sinInc = Math.sin(this.angle) * middle; 
    this.position.x=middle + sinInc;
    }
  stage.addChild(pokemon);
  return pokemon;
}

// Game Loop
function gameLoop (ts) {
    


    requestAnimationFrame(gameLoop);
    state(ts);
    renderer.render(stage);
}

// Callback Functions
function onDragStart(event) {
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  this.data = event.data;
  this.alpha = 0.5;
  this.dragging = true;
}
function onDragEnd() {
  this.alpha = 1;

  this.dragging = false;
  this.thrown =true;

  // set the interaction data to null
  this.data = null;

  console.log(this.speedX);
  console.log(this.speedY);
  console.log(this.scale.x);
  console.log(this.scale.y);
}
function onDragMove() {
  if (this.dragging) {
    var newPosition = this.data.getLocalPosition(this.parent);
    this.difX = newPosition.x - this.position.x;
    this.difY = newPosition.y - this.position.y;
    this.position.x = newPosition.x;
    this.position.y = newPosition.y;
  }
}