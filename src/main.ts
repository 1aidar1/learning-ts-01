import {Road} from "./road";
import {Car} from "./car";
import {ControlType} from "./controller";

const canvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
canvas.height = window.innerHeight;
canvas.width=300;

const ctx = canvas.getContext("2d");

const road = new Road(canvas.width,canvas.width/2,3);
const playerCar = new Car(road.getLaneCenter(Math.floor(road.laneCount/2)),
    200,30,50, ControlType.Player);
const traffic: Car[] = [
    new Car(road.getLaneCenter(Math.floor(road.laneCount/2)),
        50,30,50, ControlType.Dummy, 2)
];


function animate(){
    if (ctx){
        playerCar.update(road.borders,traffic);
        canvas.height=window.innerHeight;

        ctx.save();
        ctx.translate(0,-playerCar.coordinates.y+canvas.height*0.7)
        road.draw(ctx);

        for (let i = 0; i < traffic.length; i++) {
            traffic[i].draw(ctx);
            traffic[i].update(road.borders,traffic);
        }
        playerCar.draw(ctx);



        ctx.restore();
        requestAnimationFrame(animate);
    }

}


function main(){

    animate();

}



main()
