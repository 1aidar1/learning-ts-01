import {NeuralNetwork} from "./network";

export enum ControlType {
    Player,
    Dummy,
    AI,
}
export interface IController {
    forward: boolean;
    left: boolean;
    right: boolean;
    reverse: boolean;
    getControlType() :ControlType;
    getObject(): Object;
}
export class AIController implements IController {
    forward: boolean;
    left: boolean;
    reverse: boolean;
    right: boolean;
    brain: NeuralNetwork;

    constructor(brain :NeuralNetwork) {
        this.forward = false;
        this.left = false;
        this.right = false;
        this.reverse = false;
        this.brain = brain;
    }

    getControlType(): ControlType {
        return ControlType.AI;
    }

    getObject(): AIController {
        return this;
    }

    public feed(outputs :boolean[]){
        this.forward=outputs[0];
        this.left=outputs[1];
        this.right=outputs[2];
        this.reverse=outputs[3];
    }

}
export class KeyboardController implements IController{
    forward: boolean;
    left: boolean;
    reverse: boolean;
    right: boolean;


    constructor() {
        this.forward = false;
        this.left = false;
        this.right = false;
        this.reverse = false;
        this.addKeyboardListener();
    }

    private addKeyboardListener(){
        document.onkeydown=(event)=>{
            switch (event.key){
                case "ArrowLeft": case "a":
                    this.left = true;
                    break;
                case "ArrowRight": case "d":
                    this.right = true;
                    break;
                case "ArrowDown": case "s":
                    this.reverse = true;
                    break;
                case "ArrowUp": case "w":
                    this.forward = true;
                    break;
            }
            // console.table(this)
        }

        document.onkeyup=(event)=>{
            switch (event.key){
                case "ArrowLeft": case "a":
                    this.left = false;
                    break;
                case "ArrowRight": case "d":
                    this.right = false;
                    break;
                case "ArrowDown": case "s":
                    this.reverse = false;
                    break;
                case "ArrowUp": case "w":
                    this.forward = false;
                    break;
            }
            // console.table(this)
        }
    }

    getControlType(): ControlType {
        return ControlType.Player;
    }

    getObject(): KeyboardController {
        return this;
    }

}

export class DummyController implements IController{
    forward: boolean;
    left: boolean;
    reverse: boolean;
    right: boolean;

    constructor() {
        this.forward = true;
        this.left = false;
        this.right = false;
        this.reverse = false;
    }

    getControlType(): ControlType {
        return ControlType.Dummy;
    }
    getObject(): DummyController {
        return this;
    }
}