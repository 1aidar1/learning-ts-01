import {Road} from "./road";
import {Car} from "./car";
import {AIController, ControlType} from "./controller";
import {ITraffic} from "./traffic";
import {Level, NeuralNetwork} from "./network";


const saveBrainBtn = document.getElementById("saveBrainBtn");
const mainCanvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
mainCanvas.height = window.innerHeight;
mainCanvas.width=300;

const aiCanvas = document.getElementById("aiCanvas") as HTMLCanvasElement;
aiCanvas.width=400;
aiCanvas.height = window.innerHeight;

const mainCtx = mainCanvas.getContext("2d");
const aiCtx = aiCanvas.getContext("2d");

const road = new Road(mainCanvas.width,mainCanvas.width/2,3);
// const playerCar = new Car(road.getLaneCenter(Math.floor(road.laneCount/2)),
//     200,30,50, ControlType.AI);

const cars = generateCars(100);
let bestCar = cars[0];
const key = "bestBrain";
const storedItem = localStorage.getItem(key);
if (storedItem != null){
    const brain = JSON.parse(storedItem) as NeuralNetwork ;
    bestCar.controller = new AIController(brain);
}

const traffic: ITraffic[] = [
    new Car(road.getLaneCenter(Math.floor(road.laneCount/2)),
        50,30,50, ControlType.Dummy, 2)
];

// if (playerCar.controller.getControlType() == ControlType.AI){
//     var ai = playerCar.controller.getObject() as AIController;
// }s

function save(){
    const ai = bestCar.controller as AIController;
    const s = JSON.stringify(ai.brain);
    localStorage.setItem("bestBrain",s);
    console.log("SAVED BRAIN", s);
}

function generateCars(n :number) :Car[]{
    const cars :Car[]= [];
    for (let i = 0; i < n; i++) {
        cars.push(new Car(road.getLaneCenter(Math.floor(road.laneCount/2)),
            200,30,50, ControlType.AI));
    }
    return cars
}

function animate(){
    if (mainCtx){
        mainCanvas.height=window.innerHeight;
        mainCtx.save();
        bestCar = cars.find(
            c=>c.coordinates.y==Math.min(...cars.map(c=>c.coordinates.y))
        ) as Car;
        mainCtx.translate(0,-bestCar.coordinates.y+mainCanvas.height*0.7)
        road.draw(mainCtx);

        // playerCar.update(road.borders,traffic);
        // playerCar.draw(mainCtx);
        mainCtx.globalAlpha =0.2;

        for (let i = 0; i < cars.length; i++) {
            cars[i].update(road.borders,traffic);
            cars[i].draw(mainCtx);
        }
        mainCtx.globalAlpha =1;
        bestCar.draw(mainCtx);
        for (let i = 0; i < traffic.length; i++) {
            switch (true){
                case traffic[i] instanceof Car: // Car
                    let trafficCar = traffic[i] as Car;
                    trafficCar.draw(mainCtx);
                    trafficCar.update(road.borders,cars);
                    break;
            }
        }

        const ai = bestCar.controller as AIController;
        if (ai){
            NeuralNetwork.drawNetwork(aiCtx!,ai.brain);
        }
        mainCtx.restore();
        requestAnimationFrame(animate);
    }

}


function main(){
    animate();
    if(saveBrainBtn){
        saveBrainBtn.addEventListener("click",save);
    }

}



main()
