"use strict";
define("controller", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Controller = exports.ControlType = void 0;
    var ControlType;
    (function (ControlType) {
        ControlType[ControlType["Player"] = 0] = "Player";
        ControlType[ControlType["Dummy"] = 1] = "Dummy";
    })(ControlType || (exports.ControlType = ControlType = {}));
    class Controller {
        constructor(type) {
            this.forward = false;
            this.left = false;
            this.right = false;
            this.reverse = false;
            this.type = type;
            switch (this.type) {
                case ControlType.Player:
                    this.addKeyboardListener();
                    break;
                case ControlType.Dummy:
                    this.forward = true;
                    break;
            }
        }
        addKeyboardListener() {
            document.onkeydown = (event) => {
                switch (event.key) {
                    case "ArrowLeft":
                    case "a":
                        this.left = true;
                        break;
                    case "ArrowRight":
                    case "d":
                        this.right = true;
                        break;
                    case "ArrowDown":
                    case "s":
                        this.reverse = true;
                        break;
                    case "ArrowUp":
                    case "w":
                        this.forward = true;
                        break;
                }
                // console.table(this)
            };
            document.onkeyup = (event) => {
                switch (event.key) {
                    case "ArrowLeft":
                    case "a":
                        this.left = false;
                        break;
                    case "ArrowRight":
                    case "d":
                        this.right = false;
                        break;
                    case "ArrowDown":
                    case "s":
                        this.reverse = false;
                        break;
                    case "ArrowUp":
                    case "w":
                        this.forward = false;
                        break;
                }
                // console.table(this)
            };
        }
    }
    exports.Controller = Controller;
});
define("utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.polyIntersect = exports.getIntersection = exports.pairToCoordinatesArray = exports.lerp = void 0;
    function lerp(A, B, t) {
        return A + (B - A) * t;
    }
    exports.lerp = lerp;
    function pairToCoordinatesArray(a) {
        let out = [];
        out.push(a.start);
        out.push(a.end);
        return out;
    }
    exports.pairToCoordinatesArray = pairToCoordinatesArray;
    function getIntersection(A, B, C, D) {
        const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
        const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
        const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);
        if (bottom != 0) {
            const t = tTop / bottom;
            const u = uTop / bottom;
            if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
                return {
                    x: lerp(A.x, B.x, t),
                    y: lerp(A.y, B.y, t),
                    offset: t
                };
            }
        }
        return null;
    }
    exports.getIntersection = getIntersection;
    function polyIntersect(A, B) {
        for (let i = 0; i < A.length; i++) {
            for (let j = 0; j < B.length; j++) {
                const touch = getIntersection(A[i], A[(i + 1) % A.length], B[j], B[(j + 1) % B.length]);
                if (touch) {
                    return true;
                }
            }
        }
        return false;
    }
    exports.polyIntersect = polyIntersect;
});
define("sensor", ["require", "exports", "utils"], function (require, exports, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SensorDummy = exports.Sensor = void 0;
    class Sensor {
        constructor() {
            this.rayCount = 8;
            this.rayLen = 150;
            this.raySpread = Math.PI / 2;
            this.rays = [];
            this.reading = [];
        }
        update(genesis, angle, roadBorders, traffic) {
            this.castRays(genesis, angle);
            this.reading = [];
            for (let i = 0; i < this.rays.length; i++) {
                const reading = this.getReading(this.rays[i], roadBorders);
                this.reading.push(reading);
            }
        }
        getReading(ray, roadBoarders) {
            let touches = [];
            for (let i = 0; i < roadBoarders.length; i++) {
                const touch = (0, utils_1.getIntersection)(ray.start, ray.end, roadBoarders[i].start, roadBoarders[i].end);
                if (touch) {
                    touches.push(touch);
                }
            }
            if (touches.length == 0) {
                return null;
            }
            else {
                const offsets = touches.map(e => e.offset);
                const minOffset = Math.min(...offsets);
                return touches.find(e => e.offset == minOffset);
            }
        }
        castRays(genesis, angle) {
            this.rays = [];
            for (let i = 0; i < this.rayCount; i++) {
                const rayAngle = (0, utils_1.lerp)(this.raySpread / 2, -this.raySpread / 2, i / (this.rayCount - 1)) + angle;
                const start = { x: genesis.x, y: genesis.y };
                const end = {
                    x: genesis.x - Math.sin(rayAngle) * this.rayLen,
                    y: genesis.y - Math.cos(rayAngle) * this.rayLen
                };
                const pair = { start: start, end: end };
                this.rays.push(pair);
            }
        }
        draw(ctx) {
            for (let i = 0; i < this.rays.length; i++) {
                let end = this.rays[i].end;
                if (this.reading[i]) {
                    end = this.reading[i];
                }
                ctx.beginPath();
                ctx.strokeStyle = "yellow";
                ctx.lineWidth = 2;
                ctx.moveTo(this.rays[i].start.x, this.rays[i].start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.moveTo(end.x, end.y);
                ctx.lineTo(this.rays[i].end.x, this.rays[i].end.y);
                ctx.stroke();
            }
        }
    }
    exports.Sensor = Sensor;
    class SensorDummy {
        constructor() { }
        draw(ctx) { }
        update(genesis, angle, roadBorders, traffic) { }
    }
    exports.SensorDummy = SensorDummy;
});
define("car", ["require", "exports", "controller", "sensor", "utils"], function (require, exports, controller_1, sensor_1, utils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Car = void 0;
    class Car {
        constructor(x, y, width, height, controllerType, maxSpeed = 3, acceleration = 0.2) {
            this.coordinates = { x, y };
            this.width = width;
            this.height = height;
            this.speed = 0;
            this.acceleration = acceleration;
            this.maxSpeed = maxSpeed;
            this.friction = 0.02;
            this.frontWheelAngle = 0;
            this.polygon = this.createPolygon();
            this.damaged = false;
            this.controller = new controller_1.Controller(controllerType);
            switch (controllerType) {
                case controller_1.ControlType.Dummy:
                    this.sensor = new sensor_1.SensorDummy();
                    break;
                case controller_1.ControlType.Player:
                    this.sensor = new sensor_1.Sensor();
                    break;
                default:
                    throw new Error(controllerType);
            }
        }
        draw(ctx) {
            if (this.damaged) {
                ctx.fillStyle = "gray";
            }
            else {
                ctx.fillStyle = "black";
            }
            ctx.beginPath();
            ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
            for (let i = 1; i < this.polygon.length; i++) {
                ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
            }
            ctx.fill();
            this.sensor.draw(ctx);
        }
        update(roadBorders, traffic) {
            if (!this.damaged) {
                this.drive();
                this.polygon = this.createPolygon();
                this.damaged = this.checkDamage(roadBorders, traffic);
            }
            this.sensor.update(this.coordinates, this.frontWheelAngle, roadBorders, traffic);
        }
        checkDamage(roadBorders, traffic) {
            for (let i = 0; i < roadBorders.length; i++) {
                if ((0, utils_2.polyIntersect)(this.polygon, (0, utils_2.pairToCoordinatesArray)(roadBorders[i]))) {
                    return true;
                }
            }
            return false;
        }
        drive() {
            // change speed
            if (this.controller.forward) {
                this.speed += this.acceleration;
            }
            if (this.controller.reverse) {
                this.speed -= this.acceleration;
            }
            //control max/min
            if (this.speed > this.maxSpeed) {
                this.speed = this.maxSpeed;
            }
            if (this.speed < -this.maxSpeed / 2) {
                this.speed = -this.maxSpeed / 2;
            }
            //slow car when nothing pressed
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - this.friction);
            }
            if (this.speed < 0) {
                this.speed = Math.min(0, this.speed + this.friction);
            }
            //move right/left
            if (this.speed != 0) {
                const flip = this.speed > 0 ? 1 : -1;
                if (this.controller.left) {
                    this.frontWheelAngle += 0.03 * flip;
                }
                if (this.controller.right) {
                    this.frontWheelAngle -= 0.03 * flip;
                }
            }
            this.coordinates.x -= Math.sin(this.frontWheelAngle) * this.speed;
            this.coordinates.y -= Math.cos(this.frontWheelAngle) * this.speed;
        }
        createPolygon() {
            const vertices = [];
            const rad = Math.hypot(this.width, this.height) / 2;
            const alpha = Math.atan2(this.width, this.height);
            vertices.push({
                x: this.coordinates.x - Math.sin(this.frontWheelAngle - alpha) * rad,
                y: this.coordinates.y - Math.cos(this.frontWheelAngle - alpha) * rad
            });
            vertices.push({
                x: this.coordinates.x - Math.sin(this.frontWheelAngle + alpha) * rad,
                y: this.coordinates.y - Math.cos(this.frontWheelAngle + alpha) * rad
            });
            vertices.push({
                x: this.coordinates.x - Math.sin(Math.PI + this.frontWheelAngle - alpha) * rad,
                y: this.coordinates.y - Math.cos(Math.PI + this.frontWheelAngle - alpha) * rad
            });
            vertices.push({
                x: this.coordinates.x - Math.sin(Math.PI + this.frontWheelAngle + alpha) * rad,
                y: this.coordinates.y - Math.cos(Math.PI + this.frontWheelAngle + alpha) * rad
            });
            // console.table(points);
            // console.table(this);
            return vertices;
            // const y1 = this
        }
    }
    exports.Car = Car;
});
define("road", ["require", "exports", "utils"], function (require, exports, utils_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Road = void 0;
    const roadEnd = 10000000;
    class Road {
        constructor(width, x, laneNumber) {
            this.width = width;
            this.x = x;
            this.laneCount = laneNumber;
            this.right = x + width / 2;
            this.left = x - width / 2;
            this.top = roadEnd;
            this.bottom = -roadEnd;
            const topLeft = { x: this.left + 10, y: this.top };
            const topRight = { x: this.right - 10, y: this.top };
            const bottomLeft = { x: this.left + 10, y: this.bottom };
            const bottomRight = { x: this.right - 10, y: this.bottom };
            const leftPair = { start: bottomLeft, end: topLeft };
            const rightPair = { start: bottomRight, end: topRight };
            this.borders = [leftPair, rightPair];
        }
        getLaneCenter(index) {
            const laneWidth = this.width / this.laneCount;
            return this.left + laneWidth / 2 + Math.min(index, this.laneCount - 1) * laneWidth;
        }
        draw(ctx) {
            ctx.lineWidth = 5;
            ctx.strokeStyle = "white";
            for (let i = 1; i <= this.laneCount - 1; i++) {
                const x = (0, utils_3.lerp)(this.left, this.right, i / this.laneCount);
                ctx.setLineDash([20, 20]);
                ctx.beginPath();
                ctx.moveTo(x, this.top);
                ctx.lineTo(x, this.bottom);
                ctx.stroke();
            }
            ctx.setLineDash([]);
            this.borders.forEach(border => {
                ctx.beginPath();
                ctx.moveTo(border.start.x, border.start.y);
                ctx.lineTo(border.end.x, border.end.y);
                ctx.stroke();
            });
        }
    }
    exports.Road = Road;
});
define("main", ["require", "exports", "road", "car", "controller"], function (require, exports, road_1, car_1, controller_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const canvas = document.getElementById("mainCanvas");
    canvas.height = window.innerHeight;
    canvas.width = 300;
    const ctx = canvas.getContext("2d");
    const road = new road_1.Road(canvas.width, canvas.width / 2, 3);
    const playerCar = new car_1.Car(road.getLaneCenter(Math.floor(road.laneCount / 2)), 200, 30, 50, controller_2.ControlType.Player);
    const traffic = [
        new car_1.Car(road.getLaneCenter(Math.floor(road.laneCount / 2)), 50, 30, 50, controller_2.ControlType.Dummy, 2)
    ];
    function animate() {
        if (ctx) {
            playerCar.update(road.borders, traffic);
            canvas.height = window.innerHeight;
            ctx.save();
            ctx.translate(0, -playerCar.coordinates.y + canvas.height * 0.7);
            road.draw(ctx);
            for (let i = 0; i < traffic.length; i++) {
                traffic[i].draw(ctx);
                traffic[i].update(road.borders, traffic);
            }
            playerCar.draw(ctx);
            ctx.restore();
            requestAnimationFrame(animate);
        }
    }
    function main() {
        animate();
    }
    main();
});
