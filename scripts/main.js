define("geometry", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.polyIntersect = exports.getPolyIntersect = exports.getIntersection = exports.pairToCoordinatesArray = exports.lerp = void 0;
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
    function getPolyIntersect(A, B) {
        for (let i = 0; i < A.length; i++) {
            for (let j = 0; j < B.length; j++) {
                const touch = getIntersection(A[i], A[(i + 1) % A.length], B[j], B[(j + 1) % B.length]);
                if (touch) {
                    return touch;
                }
            }
        }
        return null;
    }
    exports.getPolyIntersect = getPolyIntersect;
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
define("utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getRGBA = void 0;
    function getRGBA(value) {
        const alpha = Math.abs(value);
        const R = value < 0 ? 0 : 255;
        const G = R;
        const B = value > 0 ? 0 : 255;
        return "rgba(" + R + "," + G + "," + B + "," + alpha + ")";
    }
    exports.getRGBA = getRGBA;
});
define("network", ["require", "exports", "geometry", "utils"], function (require, exports, geometry_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Level = exports.NeuralNetwork = void 0;
    class NeuralNetwork {
        constructor(neuronCounts) {
            this.levels = [];
            for (let i = 0; i < neuronCounts.length - 1; i++) {
                this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
            }
        }
        static feedForward(givenInputs, network) {
            let outputs = Level.feedForward(givenInputs, network.levels[0]);
            for (let i = 1; i < network.levels.length; i++) {
                outputs = Level.feedForward(outputs, network.levels[i]);
            }
            return outputs;
        }
        static drawNetwork(ctx, network) {
            const margin = 50;
            const left = margin;
            const top = margin;
            const width = ctx.canvas.width - margin * 2;
            const height = ctx.canvas.height - margin * 2;
            const levelHeight = height / network.levels.length;
            for (let i = network.levels.length - 1; i >= 0; i--) {
                const levelTop = top + (0, geometry_1.lerp)(height - levelHeight, 0, network.levels.length == 1 ? 0.5 : i / (network.levels.length - 1));
                NeuralNetwork.drawLevel(ctx, network.levels[i], left, levelTop, width, levelHeight);
            }
        }
        static drawLevel(ctx, level, left, top, width, height) {
            const right = left + width;
            const bottom = top + height;
            const nodeRadius = 18;
            const getNodeX = (nodes, index, left, right) => {
                return (0, geometry_1.lerp)(left, right, nodes.length == 1 ? 0.5 : index / (nodes.length - 1));
            };
            const { inputs, outputs } = level;
            for (let i = 0; i < inputs.length; i++) {
                for (let j = 0; j < outputs.length; j++) {
                    ctx.beginPath();
                    ctx.moveTo(getNodeX(inputs, i, left, right), bottom);
                    ctx.lineTo(getNodeX(outputs, j, left, right), top);
                    ctx.lineWidth = 0.02;
                    ctx.strokeStyle = (0, utils_1.getRGBA)(level.weights[i][j]);
                    ctx.stroke();
                }
            }
            for (let i = 0; i < inputs.length; i++) {
                const x = getNodeX(inputs, i, left, right);
                ctx.beginPath();
                ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2);
                ctx.fillStyle = "black";
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI * 2);
                ctx.fillStyle = (0, utils_1.getRGBA)(inputs[i]);
                ctx.fill();
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.arc(x, bottom, nodeRadius * 0.8, 0, Math.PI * 2);
                ctx.strokeStyle = (0, utils_1.getRGBA)(level.biases[i]);
                ctx.stroke();
            }
            for (let i = 0; i < outputs.length; i++) {
                const x = getNodeX(outputs, i, left, right);
                ctx.beginPath();
                ctx.arc(x, top, nodeRadius, 0, Math.PI * 2);
                ctx.fillStyle = "black";
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2);
                ctx.fillStyle = (0, utils_1.getRGBA)(outputs[i]);
                ctx.fill();
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.arc(x, top, nodeRadius * 0.8, 0, Math.PI * 2);
                ctx.strokeStyle = (0, utils_1.getRGBA)(level.biases[i]);
                ctx.stroke();
            }
        }
    }
    exports.NeuralNetwork = NeuralNetwork;
    class Level {
        constructor(inputCount, outCount) {
            this.inputs = new Array(inputCount);
            this.outputs = new Array(outCount);
            this.biases = new Array(outCount);
            this.weights = [];
            for (let i = 0; i < inputCount; i++) {
                this.weights[i] = new Array(outCount);
            }
            Level.randomize(this);
        }
        static randomize(level) {
            for (let i = 0; i < level.inputs.length; i++) {
                for (let j = 0; j < level.outputs.length; j++) {
                    level.weights[i][j] = Math.random() * 2 - 1;
                }
            }
            for (let i = 0; i < level.biases.length; i++) {
                level.biases[i] = Math.random() * 2 - 1;
            }
        }
        static feedForward(givenInputs, level) {
            for (let i = 0; i < level.inputs.length; i++) {
                level.inputs[i] = givenInputs[i];
            }
            for (let i = 0; i < level.outputs.length; i++) {
                let sum = 0;
                for (let j = 0; j < level.inputs.length; j++) {
                    sum += level.inputs[j] * level.weights[j][i];
                }
                if (sum > level.biases[i]) {
                    level.outputs[i] = 1;
                }
                else {
                    level.outputs[i] = 0;
                }
            }
            return level.outputs;
        }
    }
    exports.Level = Level;
});
define("controller", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DummyController = exports.KeyboardController = exports.AIController = exports.ControlType = void 0;
    var ControlType;
    (function (ControlType) {
        ControlType[ControlType["Player"] = 0] = "Player";
        ControlType[ControlType["Dummy"] = 1] = "Dummy";
        ControlType[ControlType["AI"] = 2] = "AI";
    })(ControlType || (exports.ControlType = ControlType = {}));
    class AIController {
        constructor(brain) {
            this.forward = false;
            this.left = false;
            this.right = false;
            this.reverse = false;
            this.brain = brain;
        }
        getControlType() {
            return ControlType.AI;
        }
        getObject() {
            return this;
        }
        feed(outputs) {
            this.forward = outputs[0];
            this.left = outputs[1];
            this.right = outputs[2];
            this.reverse = outputs[3];
        }
    }
    exports.AIController = AIController;
    class KeyboardController {
        constructor() {
            this.forward = false;
            this.left = false;
            this.right = false;
            this.reverse = false;
            this.addKeyboardListener();
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
        getControlType() {
            return ControlType.Player;
        }
        getObject() {
            return this;
        }
    }
    exports.KeyboardController = KeyboardController;
    class DummyController {
        constructor() {
            this.forward = true;
            this.left = false;
            this.right = false;
            this.reverse = false;
        }
        getControlType() {
            return ControlType.Dummy;
        }
        getObject() {
            return this;
        }
    }
    exports.DummyController = DummyController;
});
define("traffic", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("sensor", ["require", "exports", "geometry"], function (require, exports, geometry_2) {
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
                const reading = this.getReading(this.rays[i], roadBorders, traffic);
                this.reading.push(reading);
            }
        }
        getReading(ray, roadBoarders, traffic) {
            let touches = [];
            for (let i = 0; i < roadBoarders.length; i++) {
                const touch = (0, geometry_2.getIntersection)(ray.start, ray.end, roadBoarders[i].start, roadBoarders[i].end);
                if (touch) {
                    touches.push(touch);
                }
            }
            for (let i = 0; i < traffic.length; i++) {
                // console.log(traffic[i])
                const touch = (0, geometry_2.getPolyIntersect)((0, geometry_2.pairToCoordinatesArray)(ray), traffic[i].polygon.vertices);
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
                const rayAngle = (0, geometry_2.lerp)(this.raySpread / 2, -this.raySpread / 2, i / (this.rayCount - 1)) + angle;
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
                let color = "yellow";
                if (this.reading[i]) {
                    end = this.reading[i];
                    color = "orange";
                }
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.moveTo(this.rays[i].start.x, this.rays[i].start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.strokeStyle = "gray";
                ctx.lineWidth = 2;
                ctx.moveTo(end.x, end.y);
                ctx.lineTo(this.rays[i].end.x, this.rays[i].end.y);
                ctx.stroke();
            }
        }
    }
    exports.Sensor = Sensor;
    class SensorDummy {
        constructor() {
            this.rayCount = 0;
            this.reading = [];
        }
        draw(ctx) { }
        update(genesis, angle, roadBorders, traffic) { }
    }
    exports.SensorDummy = SensorDummy;
});
define("car", ["require", "exports", "controller", "sensor", "geometry", "network"], function (require, exports, controller_1, sensor_1, geometry_3, network_1) {
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
            switch (controllerType) {
                case controller_1.ControlType.Dummy:
                    this.sensor = new sensor_1.SensorDummy();
                    this.controller = new controller_1.DummyController();
                    break;
                case controller_1.ControlType.Player:
                    this.sensor = new sensor_1.Sensor();
                    this.controller = new controller_1.KeyboardController();
                    break;
                case controller_1.ControlType.AI:
                    this.sensor = new sensor_1.Sensor();
                    this.controller = new controller_1.AIController(new network_1.NeuralNetwork([this.sensor.rayCount, 6, 4]));
                    break;
                default:
                    throw new Error("unknown controller: " + controllerType);
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
            ctx.moveTo(this.polygon.vertices[0].x, this.polygon.vertices[0].y);
            for (let i = 1; i < this.polygon.vertices.length; i++) {
                ctx.lineTo(this.polygon.vertices[i].x, this.polygon.vertices[i].y);
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
            //AI stuff
            if (this.controller.getControlType() == controller_1.ControlType.AI) {
                const offsets = this.sensor.reading.map(s => s == null ? 0 : 1 - s.offset);
                const ai = this.controller.getObject();
                const outputs = network_1.NeuralNetwork.feedForward(offsets, ai.brain);
                console.log(outputs);
                const booleanArray = outputs.map(number => number != 0);
                ai.feed(booleanArray);
            }
        }
        checkDamage(roadBorders, traffic) {
            //Check road collision
            for (let i = 0; i < roadBorders.length; i++) {
                if ((0, geometry_3.polyIntersect)(this.polygon.vertices, (0, geometry_3.pairToCoordinatesArray)(roadBorders[i]))) {
                    return true;
                }
            }
            //Check traffic collision
            for (let i = 0; i < traffic.length; i++) {
                if ((0, geometry_3.polyIntersect)(this.polygon.vertices, traffic[i].polygon.vertices)) {
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
            return { vertices };
        }
    }
    exports.Car = Car;
});
define("road", ["require", "exports", "geometry"], function (require, exports, geometry_4) {
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
                const x = (0, geometry_4.lerp)(this.left, this.right, i / this.laneCount);
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
define("main", ["require", "exports", "road", "car", "controller", "network"], function (require, exports, road_1, car_1, controller_2, network_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const mainCanvas = document.getElementById("mainCanvas");
    mainCanvas.height = window.innerHeight;
    mainCanvas.width = 300;
    const aiCanvas = document.getElementById("aiCanvas");
    aiCanvas.width = 400;
    aiCanvas.height = window.innerHeight;
    const mainCtx = mainCanvas.getContext("2d");
    const aiCtx = aiCanvas.getContext("2d");
    const road = new road_1.Road(mainCanvas.width, mainCanvas.width / 2, 3);
    const playerCar = new car_1.Car(road.getLaneCenter(Math.floor(road.laneCount / 2)), 200, 30, 50, controller_2.ControlType.AI);
    const traffic = [
        new car_1.Car(road.getLaneCenter(Math.floor(road.laneCount / 2)), 50, 30, 50, controller_2.ControlType.Dummy, 2)
    ];
    if (playerCar.controller.getControlType() == controller_2.ControlType.AI) {
        var ai = playerCar.controller.getObject();
    }
    function animate(time) {
        if (mainCtx) {
            mainCanvas.height = window.innerHeight;
            mainCtx.save();
            mainCtx.translate(0, -playerCar.coordinates.y + mainCanvas.height * 0.7);
            road.draw(mainCtx);
            playerCar.update(road.borders, traffic);
            playerCar.draw(mainCtx);
            for (let i = 0; i < traffic.length; i++) {
                switch (true) {
                    case traffic[i] instanceof car_1.Car: // Car
                        let trafficCar = traffic[i];
                        trafficCar.draw(mainCtx);
                        trafficCar.update(road.borders, [playerCar]);
                        break;
                }
            }
            if (ai) {
                network_2.NeuralNetwork.drawNetwork(aiCtx, ai.brain);
            }
            mainCtx.restore();
            requestAnimationFrame(animate);
        }
    }
    function main() {
        animate(0);
    }
    main();
});
