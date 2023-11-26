import {Car} from "./car";
import {CoordinatePair, Coordinates, getIntersection, lerp, Polygon} from "./utils";

export interface SensorI {
    draw(ctx: CanvasRenderingContext2D): void;
    update(genesis: Coordinates, angle: number,roadBorders: CoordinatePair[], traffic: Polygon[]) :void

}

export class Sensor implements SensorI{
    rayCount: number;
    rayLen: number;
    raySpread: number;
    rays: CoordinatePair[];
    reading: (Coordinates | null | undefined)[];

    constructor() {
        this.rayCount=8;
        this.rayLen=150;
        this.raySpread = Math.PI/2;
        this.rays = [];
        this.reading = [];
    }

    update(genesis: Coordinates, angle: number,roadBorders: CoordinatePair[], traffic: Polygon[]) :void{
        this.castRays(genesis,angle);
        this.reading = [];
        for (let i = 0; i < this.rays.length; i++) {
            const reading = this.getReading(this.rays[i],roadBorders);
            this.reading.push(reading);
        }
    }

    private getReading(ray: CoordinatePair, roadBoarders: CoordinatePair[]) :Coordinates | null | undefined{
        let touches=[];
        for (let i = 0; i < roadBoarders.length; i++) {
            const touch = getIntersection(
                ray.start,
                ray.end,
                roadBoarders[i].start,
                roadBoarders[i].end
            );
            if (touch){
                touches.push(touch);
            }
        }
        if (touches.length == 0){
            return null;
        } else {
            const offsets = touches.map(e=>e.offset);
            const minOffset = Math.min(...offsets);
            return touches.find(e=>e.offset==minOffset);
        }
    }

    private castRays(genesis: Coordinates,angle: number){
        this.rays = [];
        for (let i=0;i<this.rayCount;i++){
            const rayAngle = lerp(
                this.raySpread/2,
                -this.raySpread/2,
                i/(this.rayCount-1)
            )+angle;
            const start: Coordinates= {x: genesis.x, y: genesis.y};
            const end: Coordinates= {
                x: genesis.x - Math.sin(rayAngle)*this.rayLen,
                y: genesis.y - Math.cos(rayAngle)*this.rayLen
            };
            const pair: CoordinatePair = {start: start, end: end};
            this.rays.push(pair)
        }
    }

    draw(ctx: CanvasRenderingContext2D){
        for(let i=0;i<this.rays.length;i++){
            let end: Coordinates = this.rays[i].end;
            if (this.reading[i]){
                end = this.reading[i]!;
            }
            ctx.beginPath();
            ctx.strokeStyle = "yellow";
            ctx.lineWidth = 2;
            ctx.moveTo(this.rays[i].start.x,this.rays[i].start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.moveTo(end.x,end.y);
            ctx.lineTo(this.rays[i].end.x, this.rays[i].end.y);
            ctx.stroke();
        }
    }
}

export class SensorDummy implements SensorI{

    constructor() {}
    draw(ctx: CanvasRenderingContext2D): void {}

    update(genesis: Coordinates, angle: number, roadBorders: CoordinatePair[], traffic: Polygon[]): void {}
}