import {Controller, ControlType} from "./controller";
import {Sensor,SensorI,SensorDummy} from "./sensor";
import {CoordinatePair, Coordinates, pairToCoordinatesArray, polyIntersect,} from "./utils";

export class Car {
    coordinates: Coordinates;
    height: number;
    width: number;
    speed: number;
    acceleration: number;
    maxSpeed: number;
    friction: number;
    frontWheelAngle: number;
    damaged: boolean;
    sensor: SensorI;
    controller: Controller;
    polygon: Coordinates[];

    constructor(x: number,y: number,width: number,height:number, controllerType: ControlType, maxSpeed: number = 3,acceleration: number = 0.2) {
        this.coordinates = {x,y};
        this.width = width;
        this.height = height;
        this.speed = 0;
        this.acceleration = acceleration;
        this.maxSpeed = maxSpeed;
        this.friction = 0.02;
        this.frontWheelAngle = 0;
        this.polygon = this.createPolygon();
        this.damaged = false;

        this.controller = new Controller(controllerType);
        switch (controllerType){
            case ControlType.Dummy:
                this.sensor = new SensorDummy()
                break;
            case ControlType.Player:
                this.sensor = new Sensor();
                break;
            default:
                throw new Error(controllerType);
        }
    }

    draw(ctx: CanvasRenderingContext2D){
        if (this.damaged){
            ctx.fillStyle = "gray";
        } else {
            ctx.fillStyle = "black";
        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x,this.polygon[i].y)
        }
        ctx.fill();
        this.sensor.draw(ctx);
    }

    update(roadBorders: CoordinatePair[],traffic: Car[]){
        if (!this.damaged){
            this.drive();
            this.polygon = this.createPolygon();
            this.damaged = this.checkDamage(roadBorders,traffic);
        }
        this.sensor.update(this.coordinates,this.frontWheelAngle,roadBorders,traffic);
    }

    private checkDamage(roadBorders: CoordinatePair[],traffic: Car[]) :boolean {
        for (let i = 0; i < roadBorders.length; i++) {

            if (polyIntersect(this.polygon, pairToCoordinatesArray(roadBorders[i]))){
                return true;
            }
        }

        return false
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

        this.coordinates.x-=Math.sin(this.frontWheelAngle)*this.speed;
        this.coordinates.y-=Math.cos(this.frontWheelAngle)*this.speed;
    }

    private  createPolygon() :Coordinates[] {
        const vertices :Coordinates[] = [];
        const rad = Math.hypot(this.width, this.height)/2;
        const alpha = Math.atan2(this.width, this.height);


        vertices.push({
            x: this.coordinates.x-Math.sin(this.frontWheelAngle-alpha)*rad,
            y: this.coordinates.y-Math.cos(this.frontWheelAngle-alpha)*rad
        });

        vertices.push({
            x: this.coordinates.x-Math.sin(this.frontWheelAngle+alpha)*rad,
            y: this.coordinates.y-Math.cos(this.frontWheelAngle+alpha)*rad
        });

        vertices.push({
            x: this.coordinates.x-Math.sin(Math.PI+this.frontWheelAngle-alpha)*rad,
            y: this.coordinates.y-Math.cos(Math.PI+this.frontWheelAngle-alpha)*rad
        });

        vertices.push({
            x: this.coordinates.x-Math.sin(Math.PI+this.frontWheelAngle+alpha)*rad,
            y: this.coordinates.y-Math.cos(Math.PI+this.frontWheelAngle+alpha)*rad
        });
        // console.table(points);
        // console.table(this);
        return vertices;
        // const y1 = this
    }

}

