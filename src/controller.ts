export enum ControlType {
    Player,
    Dummy,
}

export class Controller{
    forward: boolean;
    left: boolean;
    right: boolean;
    reverse: boolean;
    type: ControlType;


    constructor(type: ControlType) {
        this.forward = false;
        this.left = false;
        this.right = false;
        this.reverse = false;
        this.type = type;
        switch (this.type){
            case ControlType.Player:
                this.addKeyboardListener();
                break;
            case ControlType.Dummy:
                this.forward = true;
                break;
        }
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
}