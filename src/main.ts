import {Road} from "./road";
import {Car} from "./car";

const canvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
canvas.height = window.innerHeight;
canvas.width=200;

const ctx = canvas.getContext("2d");

const road = new Road(canvas.width,canvas.width/2,3);
const car = new Car(100,200,30,50);
car.draw(ctx);



function animate(){
    car.update();
    canvas.height=window.innerHeight;

    road.draw(ctx);
    car.draw(ctx);
    requestAnimationFrame(animate);
}


function main(){

    animate();

}



main()
