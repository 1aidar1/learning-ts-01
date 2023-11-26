import {Controller, ControlType} from "./controller";
import {Sensor,SensorI,SensorDummy} from "./sensor";
import {Line, Coordinates, pairToCoordinatesArray, Polygon, polyIntersect,} from "./geometry";
import {ITraffic} from "./traffic";

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
    polygon: Polygon;

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
        ctx.moveTo(this.polygon.vertices[0].x, this.polygon.vertices[0].y);
        for (let i = 1; i < this.polygon.vertices.length; i++) {
            ctx.lineTo(this.polygon.vertices[i].x,this.polygon.vertices[i].y);
        }
        ctx.fill();
        this.sensor.draw(ctx);
    }

    update(roadBorders: Line[], traffic: ITraffic[]){
        if (!this.damaged){
            this.drive();
            this.polygon = this.createPolygon();
            this.damaged = this.checkDamage(roadBorders,traffic);
        }
        this.sensor.update(this.coordinates,this.frontWheelAngle,roadBorders,traffic);
    }

    private checkDamage(roadBorders: Line[], traffic: ITraffic[]) :boolean {
        //Check road collision
        for (let i = 0; i < roadBorders.length; i++) {
            if (polyIntersect(this.polygon.vertices, pairToCoordinatesArray(roadBorders[i]))){
                return true;
            }
        }
        //Check traffic collision
        for (let i = 0; i < traffic.length; i++) {
            if (polyIntersect(this.polygon.vertices, traffic[i].polygon.vertices)){
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

    private  createPolygon() :Polygon {
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
        return {vertices};
    }

}

