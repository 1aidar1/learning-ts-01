import {Road} from "./road";
import {Car} from "./car";
import {AIController, ControlType} from "./controller";
import {ITraffic} from "./traffic";
import {NeuralNetwork} from "./network";

const mainCanvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
mainCanvas.height = window.innerHeight;
mainCanvas.width=300;

const aiCanvas = document.getElementById("aiCanvas") as HTMLCanvasElement;
aiCanvas.width=400;
aiCanvas.height = window.innerHeight;

const mainCtx = mainCanvas.getContext("2d");
const aiCtx = aiCanvas.getContext("2d");

const road = new Road(mainCanvas.width,mainCanvas.width/2,3);
const playerCar = new Car(road.getLaneCenter(Math.floor(road.laneCount/2)),
    200,30,50, ControlType.AI);
const traffic: ITraffic[] = [
    new Car(road.getLaneCenter(Math.floor(road.laneCount/2)),
        50,30,50, ControlType.Dummy, 2)
];

if (playerCar.controller.getControlType() == ControlType.AI){
    var ai = playerCar.controller.getObject() as AIController;
}

function animate(){
    if (mainCtx){
        mainCanvas.height=window.innerHeight;

        mainCtx.save();
        mainCtx.translate(0,-playerCar.coordinates.y+mainCanvas.height*0.7)
        road.draw(mainCtx);

        playerCar.update(road.borders,traffic);
        playerCar.draw(mainCtx);

        for (let i = 0; i < traffic.length; i++) {
            switch (true){
                case traffic[i] instanceof Car: // Car
                    let trafficCar = traffic[i] as Car;
                    trafficCar.draw(mainCtx);
                    trafficCar.update(road.borders,[playerCar]);
                    break;
            }
        }



        if (ai){
            NeuralNetwork.drawNetwork(aiCtx!,ai.brain);
        }
        mainCtx.restore();
        requestAnimationFrame(animate);
    }

}


function main(){

    animate(0);

}



main()
