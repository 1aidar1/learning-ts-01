

const roadEnd = 10000000;
export class Road {
    width: number;
    x: number;
    laneNumber: number;
    right: number;
    left: number;
    top: number;
    bottom: number;


    constructor(width: number, x: number, laneNumber: number) {
        this.width = width;
        this.x = x;
        this.laneNumber = laneNumber;
        this.right = x+width/2;
        this.left = x-width/2;
        this.top = roadEnd;
        this.bottom = -roadEnd;
    }


    draw(ctx: CanvasRenderingContext2D | null){
        if (ctx != null){
            ctx.lineWidth =5;
            ctx.strokeStyle="white";

            ctx.beginPath();
            ctx.moveTo(this.left,this.top);
            ctx.lineTo(this.left,this.bottom);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(this.right,this.top);
            ctx.lineTo(this.right,this.bottom);
            ctx.stroke();

        } else {
            throw Error("canvas ctx is null");
        }
    }
}

