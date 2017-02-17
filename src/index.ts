interface Context2D {
    beginPath: ()=>void;
    clearRect: (x:number, y:number, w:number, h:number)=>void;
    rect: (x:number, y:number, w:number, h:number)=>void;
    fillStyle: string;
    fill: ()=>void;
}

interface Canvas {
    width: number;
    height: number;
}

var canvas = <HTMLCanvasElement> document.getElementById("canvas");
var ctx = <Context2D> canvas.getContext("2d");

function animate(objects: Array<WorldObject>, timeDelta: number) {
  var gravity = new Force(new Vector(0, 0.000981));
  var fixed: Array<FixedWorldObject> = <Array<FixedWorldObject>> objects.filter(function(object: WorldObject) { return object instanceof FixedWorldObject});
  objects.forEach(function(o) {
    o.applyForce(gravity, timeDelta);
    o.detectCollision(fixed, function(collider: FixedWorldObject) {
      o.onCollisionStart(collider);
      //objects.push(new BloodCell(o.position, 500));
    });
    o.update(timeDelta);
  });
}

function draw(objects: Array<WorldObject>, ctx: Context2D, canvas: Canvas) {
  var simplePainter = new SimplePainter(ctx);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  objects.forEach(function(e: WorldObject) {
    e.acceptPainter(simplePainter);
  })
}

interface Painter {
    paintBloodCell(object: BloodCell): void;
    paintFloor(object: Floor): void;
}

class SimplePainter implements Painter{
  private _ctx: Context2D;
  constructor(ctx: Context2D){
  	this._ctx = ctx;
  }
  paintBloodCell(object: BloodCell) {
  	this._ctx.beginPath();
    this._ctx.rect(object.position.x, object.position.y, 1, 1);
    this._ctx.fillStyle = 'black';
    this._ctx.fill();
  }
  paintFloor(object: Floor){
  	this._ctx.beginPath();
    this._ctx.rect(object.position.x, object.position.y, object.size.x, object.size.y);
    this._ctx.fillStyle = '#f0f0f0';
    this._ctx.fill();
  }
}

class Vector {
  private _x: number;
  private _y: number;
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }
  get x(): number {
    return this._x;
  }
  get y(): number {
    return this._y;
  }
  set x(val: number) {
    this._x = val;
  }
  set y(val: number) {
    this._y = val;
  }
}

class Force {
	private _vector: Vector;
	constructor(vector: Vector){
  	this._vector = vector;
  }
  apply(object: WorldObject, time: number){
  	if(object.weight) {
    	object.speed.x += this._vector.x * time / object.weight;
      object.speed.y += this._vector.y * time / object.weight;
    }
  }
}

abstract class WorldObject {
  protected _enabled: boolean = true;
  protected _position: Vector;
  private _weight: number;
  private _speed: Vector = new Vector(0,0);
	constructor(position: Vector, weight: number){
  	this._position = position;
    this._weight = weight;
  }
  get enabled() { return this._enabled; }
  set enabled(val) { this._enabled = val; }
  get position() { return this._position; }
  get speed() { return this._speed; }
  get weight() { return this._weight; }
  applyForce(force: Force, time: number){
  	force.apply(this, time);
  }
  abstract acceptPainter(painter: Painter): void;
  abstract detectCollision(objects: Array<FixedWorldObject>, callback: (object:FixedWorldObject)=>void): void;
  update(time: number){
    if(this._enabled){
  	  this._position.x += this._speed.x * time;
      this._position.y += this._speed.y * time;
    }
  }
  onCollisionStart(object: FixedWorldObject) {  }
  onCollisionEnd(object: FixedWorldObject) {  }
}

class BloodCell extends WorldObject{
  acceptPainter(painter: Painter){
    if(this.enabled){
  	  painter.paintBloodCell(this);
    }
  }
  detectCollision(objects: Array<FixedWorldObject>, callback: (object:FixedWorldObject)=>void){
    var that = this;
    if(this.enabled){
      objects.forEach(function(object: FixedWorldObject){
        if(object.boundingBox.contains(that._position)){
          callback(object);
        }
      });
    }
  }
  onCollisionStart(object: FixedWorldObject) {
    this._enabled = false;
    TheGameState.newObject(new BloodCell(this._position, 50));
  }
}

abstract class FixedWorldObject extends WorldObject{
  private _boundingBox: Rectangle;
  constructor(position: Vector, boundingBox: Rectangle){
  	super(position, 0);
    this._boundingBox = boundingBox;
  }
  get boundingBox() { return this._boundingBox; }
  applyForce(force: Force, time: number){}
  update(time: number){}
  detectCollision(objects: Array<FixedWorldObject>, callback: (object:FixedWorldObject)=>void){}
}

class Floor extends FixedWorldObject{
  private _size: Vector;
  constructor(position: Vector, size: Vector){
  	super(position, new Rectangle(position, size));
    this._size = size;
  }
  get size() { return this._size }
  applyForce(force: Force, time: number) { }
    acceptPainter(painter: Painter){
  	painter.paintFloor(this);
  }
  update(time: number) { }
}

class Rectangle {
  private _position: Vector;
  private _size: Vector;
  constructor(position: Vector, size: Vector) {    
    this._position = position;
    this._size = size;
  }
  
  contains(point: Vector){
    return point.x >= this._position.x && point.x <= (this._position.x+this._size.x) &&
      point.y >= this._position.y && point.y <= (this._position.y+this._size.y)
  }
}

function nextFrame(objects: Array<WorldObject>, ctx: Context2D, canvas: Canvas, lastTime: number) {
  var currentTime = new Date().getTime();
  var timeDelta = currentTime - lastTime;

  animate(objects, timeDelta);
  draw(objects, ctx, canvas);

  window.requestAnimationFrame(function() {
    nextFrame(objects, ctx, canvas, currentTime);
  });
}

class GameState{
  private _worldObjects: Array<WorldObject> = [];
  get worldObjects() { return this._worldObjects; }
  newObject(object: WorldObject) {
    this._worldObjects.push(object);
  }
}

const TheGameState: GameState = new GameState();

for (var i = 0; i < 1000; i++) {
  //TheGameState.newObject(new BloodCell(new Vector(Math.random() * 640, Math.random() * 360), 5));
}

TheGameState.newObject(new Floor(new Vector(0, 300), new Vector(300, 5)))

canvas.onclick = function(e) {
    var cx = e.offsetX;
    var cy = e.offsetY;
    for (var i = 0; i < 50; i++) {
        var cell = new BloodCell(new Vector(cx,cy), 5)
        cell.applyForce(new Force(new Vector(Math.random()*4-2,Math.random()*4-2)), 1);
        TheGameState.newObject(cell);
    }
  }
  //worldObjects[0].acceptForce(new Force([1,-1]), 1);

nextFrame(TheGameState.worldObjects, ctx, canvas, new Date().getTime());
