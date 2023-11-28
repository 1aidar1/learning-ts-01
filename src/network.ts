import {lerp} from "./geometry";
import {getRGBA} from "./utils";

export class NeuralNetwork {
    levels: Level[];

    init(neuronCounts: number[]) :NeuralNetwork{
        const levels :Level[] = [];
        for(let i=0;i<neuronCounts.length-1;i++){
            levels.push(new Level(
                neuronCounts[i],neuronCounts[i+1]
            ));
        }
        return new NeuralNetwork(levels);
    }

    constructor(levels: Level[] = []) {
        this.levels = levels;
    }

    static feedForward(givenInputs: number[],network: NeuralNetwork) :number[]{
        // console.log("feedForward",network);
        let outputs=Level.feedForward(
            givenInputs,network.levels[0]);
        for(let i=1;i<network.levels.length;i++){
            outputs=Level.feedForward(
                outputs,network.levels[i]);
        }

        return outputs;
    }

    static drawNetwork(ctx: CanvasRenderingContext2D, network: NeuralNetwork){
        const margin = 50;
        const left = margin;
        const top = margin;
        const width = ctx.canvas.width-margin*2;
        const height = ctx.canvas.height-margin*2;
        const levelHeight = height/network.levels.length;
        for (let i = network.levels.length-1; i >= 0; i--) {
            const levelTop=top+lerp(height-levelHeight,0,
                network.levels.length==1?0.5:i/(network.levels.length-1));
            NeuralNetwork.drawLevel(ctx,network.levels[i],left,levelTop,width,levelHeight);
        }

    }
    static drawLevel(ctx: CanvasRenderingContext2D, level: Level,left :number,top :number, width :number, height :number){
        const right = left + width;
        const bottom = top + height;
        const nodeRadius = 18;

        const getNodeX =(nodes :number[],index :number,left :number,right :number) =>{
            return lerp(
                left,right,nodes.length==1?0.5:index/(nodes.length-1)
            )
        };

        const {inputs, outputs} = level;



        for (let i = 0; i < inputs.length; i++) {
            for (let j = 0; j < outputs.length; j++) {
                ctx.beginPath();
                ctx.moveTo(getNodeX(inputs,i,left,right),bottom);
                ctx.lineTo(getNodeX(outputs,j,left,right),top);
                ctx.lineWidth = 0.02;
                ctx.strokeStyle =getRGBA(level.weights[i][j]);
                ctx.stroke();
            }
        }

        for (let i = 0; i < inputs.length; i++) {
            const x = getNodeX(inputs,i,left,right);
            ctx.beginPath();
            ctx.arc(x,bottom,nodeRadius,0,Math.PI*2);
            ctx.fillStyle="black";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x,bottom,nodeRadius*0.6,0,Math.PI*2);
            ctx.fillStyle=getRGBA(inputs[i]);
            ctx.fill();

            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.arc(x,bottom,nodeRadius*0.8,0,Math.PI*2);
            ctx.strokeStyle = "white";
            ctx.stroke();
        }

        for (let i = 0; i < outputs.length; i++) {
            const x = getNodeX(outputs,i,left,right);
            ctx.beginPath();
            ctx.arc(x,top,nodeRadius,0,Math.PI*2);
            ctx.fillStyle="black";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x,top,nodeRadius*0.6,0,Math.PI*2);
            ctx.fillStyle=getRGBA(outputs[i]);
            ctx.fill();

            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.arc(x,top,nodeRadius*0.8,0,Math.PI*2);
            ctx.strokeStyle = "white";
            ctx.stroke();
        }


    }

}



export class Level {
    inputs: Array<number>;
    outputs: Array<number>;
    biases: Array<number>;
    weights: Array<number>[];


    constructor(inputCount: number, outCount: number) {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outCount);
        this.biases = new Array(outCount);
        this.weights = [];
        for(let i=0;i<inputCount;i++){
            this.weights[i] = new Array(outCount);
        }
        Level.randomize(this);
    }


    private static randomize(level: Level){
        for(let i=0;i<level.inputs.length;i++){
            for(let j=0;j<level.outputs.length;j++){
                level.weights[i][j]=Math.random()*2-1;
            }
        }

        for(let i=0;i<level.biases.length;i++){
            level.biases[i]=Math.random()*2-1;
        }
    }

    static feedForward(givenInputs: number[],level: Level) :number[]{
        for(let i=0;i<level.inputs.length;i++){
            level.inputs[i]=givenInputs[i];
        }

        for(let i=0;i<level.outputs.length;i++){
            let sum=0
            for(let j=0;j<level.inputs.length;j++){
                sum+=level.inputs[j]*level.weights[j][i];
            }

            if(sum>level.biases[i]){
                level.outputs[i]=1;
            }else{
                level.outputs[i]=0;
            }
        }

        return level.outputs;
    }
}