
import {CoordinatePair, Coordinates, lerp} from "./utils";

const roadEnd = 10000000;


export class Road {
    width: number;
    x: number;
    laneCount: number;
    right: number;
    left: number;
    top: number;
    bottom: number;

    borders: CoordinatePair[];

    constructor(width: number, x: number, laneNumber: number) {
        this.width = width;
        this.x = x;
        this.laneCount = laneNumber;
        this.right = x+width/2;
        this.left = x-width/2;
        this.top = roadEnd;
        this.bottom = -roadEnd;

        const topLeft: Coordinates= {x:this.left+10,y:this.top};
        const topRight: Coordinates = {x:this.right-10,y:this.top};
        const bottomLeft: Coordinates = {x:this.left+10,y:this.bottom};
        const bottomRight: Coordinates = {x:this.right-10,y:this.bottom};

        const leftPair: CoordinatePair = {start: bottomLeft, end: topLeft};
        const rightPair: CoordinatePair = {start: bottomRight, end: topRight};

        this.borders = [leftPair,rightPair];
    }

    getLaneCenter(index: number) :number{
        const laneWidth = this.width/this.laneCount;
        return this.left+laneWidth/2+Math.min(index,this.laneCount-1)*laneWidth;
    }

    draw(ctx: CanvasRenderingContext2D){
        ctx.lineWidth =5;
        ctx.strokeStyle="white";

        for(let i=1; i<=this.laneCount-1; i++){
            const x = lerp(
                this.left,
                this.right,
                i/this.laneCount
            );
            ctx.setLineDash([20,20]);
            ctx.beginPath();
            ctx.moveTo(x,this.top);
            ctx.lineTo(x,this.bottom);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        this.borders.forEach(border=>{
            ctx.beginPath();
            ctx.moveTo(border.start.x,border.start.y);
            ctx.lineTo(border.end.x,border.end.y)
            ctx.stroke();
        });

    }
}

