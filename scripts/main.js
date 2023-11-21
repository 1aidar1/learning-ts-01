define("controller", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Controller = void 0;
    class Controller {
        // keyboardListener
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
                        this.left = true;
                        break;
                    case "ArrowRight":
                        this.right = true;
                        break;
                    case "ArrowDown":
                        this.reverse = true;
                        break;
                    case "ArrowUp":
                        this.forward = true;
                        break;
                }
                // console.table(this)
            };
            document.onkeyup = (event) => {
                switch (event.key) {
                    case "ArrowLeft":
                        this.left = false;
                        break;
                    case "ArrowRight":
                        this.right = false;
                        break;
                    case "ArrowDown":
                        this.reverse = false;
                        break;
                    case "ArrowUp":
                        this.forward = false;
                        break;
                }
                // console.table(this)
            };
        }
    }
    exports.Controller = Controller;
});
define("car", ["require", "exports", "controller"], function (require, exports, controller_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Car = void 0;
    class Car {
        constructor(x, y, width, height, acceleration) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.controller = new controller_1.Controller();
            this.speed = 0;
            this.acceleration = acceleration ? acceleration : 0.2;
            this.maxSpeed = 3;
            this.friction = 0.02;
            this.frontWheelAngle = 0;
            console.log(this);
        }
        draw(ctx) {
            if (ctx != null) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(-this.frontWheelAngle);
                ctx.beginPath();
                ctx.rect(-this.width / 2, -this.width / 2, this.width, this.height);
                ctx.fill();
                // ctx.restore();
            }
            else {
                throw Error("canvas ctx is null");
            }
        }
        update() {
            this.drive();
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
            this.x -= Math.sin(this.frontWheelAngle) * this.speed;
            this.y -= Math.cos(this.frontWheelAngle) * this.speed;
        }
    }
    exports.Car = Car;
});
define("road", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Road = void 0;
    const roadEnd = 10000000;
    class Road {
        constructor(width, x, laneNumber) {
            this.width = width;
            this.x = x;
            this.laneNumber = laneNumber;
            this.right = x + width / 2;
            this.left = x - width / 2;
            this.top = roadEnd;
            this.bottom = -roadEnd;
        }
        draw(ctx) {
            if (ctx != null) {
                ctx.lineWidth = 5;
                ctx.strokeStyle = "white";
                ctx.beginPath();
                ctx.moveTo(this.left, this.top);
                ctx.lineTo(this.left, this.bottom);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(this.right, this.top);
                ctx.lineTo(this.right, this.bottom);
                ctx.stroke();
            }
            else {
                throw Error("canvas ctx is null");
            }
        }
    }
    exports.Road = Road;
});
define("main", ["require", "exports", "road", "car"], function (require, exports, road_1, car_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const canvas = document.getElementById("mainCanvas");
    canvas.height = window.innerHeight;
    canvas.width = 200;
    const ctx = canvas.getContext("2d");
    const road = new road_1.Road(canvas.width, canvas.width / 2, 3);
    const car = new car_1.Car(100, 200, 30, 50);
    car.draw(ctx);
    function animate() {
        car.update();
        canvas.height = window.innerHeight;
        road.draw(ctx);
        car.draw(ctx);
        requestAnimationFrame(animate);
    }
    function main() {
        animate();
    }
    main();
});
