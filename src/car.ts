import {Controller} from "./controller";

export class Car {
    x: number;
    y: number;
    height: number;
    width: number;
    controller: Controller;

    speed: number;
    acceleration: number;

    maxSpeed: number;
    friction: number;

    frontWheelAngle: number;
    

    constructor(x: number,y: number,width: number,height:number, acceleration?: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.controller = new Controller();
        this.speed = 0;
        this.acceleration = acceleration ? acceleration : 0.2;
        this.maxSpeed = 3;
        this.friction = 0.02;
        this.frontWheelAngle = 0;
        console.log(this)
    }

    draw(ctx: CanvasRenderingContext2D | null){
        if (ctx != null){
            ctx.save();
            ctx.translate(this.x,this.y);
            ctx.rotate(-this.frontWheelAngle);
            ctx.beginPath();
            ctx.rect(
                -this.width/2,
                -this.width/2,
                this.width,
                this.height
            );
            ctx.fill();
            // ctx.restore();
        } else {
            throw Error("canvas ctx is null");
        }
    }

    update(){
        this.drive();
    }

    private drive(){
        // change speed
        if (this.controller.forward){
            this.speed += this.acceleration;
        }
        if (this.controller.reverse){
            this.speed -= this.acceleration;
        }

        //control max/min
        if (this.speed > this.maxSpeed){
            this.speed = this.maxSpeed;
        }
        if (this.speed < -this.maxSpeed/2){
            this.speed = -this.maxSpeed/2;
        }

        //slow car when nothing pressed
        if (this.speed>0){
            this.speed = Math.max(0,this.speed - this.friction);
        }
        if (this.speed<0){
            this.speed = Math.min(0,this.speed + this.friction);
        }

        //move right/left
        if (this.speed!=0){
            const flip = this.speed>0 ? 1 : -1;
            if (this.controller.left){
                this.frontWheelAngle += 0.03*flip;
            }
            if (this.controller.right){
                this.frontWheelAngle -= 0.03*flip;
            }
        }

        this.x-=Math.sin(this.frontWheelAngle)*this.speed;
        this.y-=Math.cos(this.frontWheelAngle)*this.speed;
    }

}

declare class Greeter {
    constructor(customGreeting?: string);
    greet: void;
}