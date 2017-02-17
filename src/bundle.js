/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
function animate(objects, timeDelta) {
    var gravity = new Force(new Vector(0, 0.000981));
    var fixed = objects.filter(function (object) { return object instanceof FixedWorldObject; });
    objects.forEach(function (o) {
        o.applyForce(gravity, timeDelta);
        o.detectCollision(fixed, function (collider) {
            o.onCollisionStart(collider);
        });
        o.update(timeDelta);
    });
}
function draw(objects, ctx, canvas) {
    var simplePainter = new SimplePainter(ctx);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach(function (e) {
        e.acceptPainter(simplePainter);
    });
}
class SimplePainter {
    constructor(ctx) {
        this._ctx = ctx;
    }
    paintBloodCell(object) {
        this._ctx.beginPath();
        this._ctx.rect(object.position.x, object.position.y, 1, 1);
        this._ctx.fillStyle = 'black';
        this._ctx.fill();
    }
    paintFloor(object) {
        this._ctx.beginPath();
        this._ctx.rect(object.position.x, object.position.y, object.size.x, object.size.y);
        this._ctx.fillStyle = '#f0f0f0';
        this._ctx.fill();
    }
}
class Vector {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    set x(val) {
        this._x = val;
    }
    set y(val) {
        this._y = val;
    }
}
class Force {
    constructor(vector) {
        this._vector = vector;
    }
    apply(object, time) {
        if (object.weight) {
            object.speed.x += this._vector.x * time / object.weight;
            object.speed.y += this._vector.y * time / object.weight;
        }
    }
}
class WorldObject {
    constructor(position, weight) {
        this._enabled = true;
        this._speed = new Vector(0, 0);
        this._position = position;
        this._weight = weight;
    }
    get enabled() { return this._enabled; }
    set enabled(val) { this._enabled = val; }
    get position() { return this._position; }
    get speed() { return this._speed; }
    get weight() { return this._weight; }
    applyForce(force, time) {
        force.apply(this, time);
    }
    update(time) {
        if (this._enabled) {
            this._position.x += this._speed.x * time;
            this._position.y += this._speed.y * time;
        }
    }
    onCollisionStart(object) { }
    onCollisionEnd(object) { }
}
class BloodCell extends WorldObject {
    acceptPainter(painter) {
        if (this.enabled) {
            painter.paintBloodCell(this);
        }
    }
    detectCollision(objects, callback) {
        var that = this;
        if (this.enabled) {
            objects.forEach(function (object) {
                if (object.boundingBox.contains(that._position)) {
                    callback(object);
                }
            });
        }
    }
    onCollisionStart(object) {
        this._enabled = false;
        TheGameState.newObject(new BloodCell(this._position, 50));
    }
}
class FixedWorldObject extends WorldObject {
    constructor(position, boundingBox) {
        super(position, 0);
        this._boundingBox = boundingBox;
    }
    get boundingBox() { return this._boundingBox; }
    applyForce(force, time) { }
    update(time) { }
    detectCollision(objects, callback) { }
}
class Floor extends FixedWorldObject {
    constructor(position, size) {
        super(position, new Rectangle(position, size));
        this._size = size;
    }
    get size() { return this._size; }
    applyForce(force, time) { }
    acceptPainter(painter) {
        painter.paintFloor(this);
    }
    update(time) { }
}
class Rectangle {
    constructor(position, size) {
        this._position = position;
        this._size = size;
    }
    contains(point) {
        return point.x >= this._position.x && point.x <= (this._position.x + this._size.x) &&
            point.y >= this._position.y && point.y <= (this._position.y + this._size.y);
    }
}
function nextFrame(objects, ctx, canvas, lastTime) {
    var currentTime = new Date().getTime();
    var timeDelta = currentTime - lastTime;
    animate(objects, timeDelta);
    draw(objects, ctx, canvas);
    window.requestAnimationFrame(function () {
        nextFrame(objects, ctx, canvas, currentTime);
    });
}
class GameState {
    constructor() {
        this._worldObjects = [];
    }
    get worldObjects() { return this._worldObjects; }
    newObject(object) {
        this._worldObjects.push(object);
    }
}
const TheGameState = new GameState();
for (var i = 0; i < 1000; i++) {
}
TheGameState.newObject(new Floor(new Vector(0, 300), new Vector(300, 5)));
canvas.onclick = function (e) {
    var cx = e.offsetX;
    var cy = e.offsetY;
    for (var i = 0; i < 100; i++) {
        var cell = new BloodCell(new Vector(cx, cy), 5);
        cell.applyForce(new Force(new Vector(Math.random() * 4 - 2, Math.random() * 4 - 2)), 1);
        TheGameState.newObject(cell);
    }
};
nextFrame(TheGameState.worldObjects, ctx, canvas, new Date().getTime());


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map