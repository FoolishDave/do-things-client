import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener
} from "@angular/core";
import io from "socket.io-client";
import { CONTEXT } from "@angular/core/src/render3/interfaces/view";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"]
})
export class GameComponent implements OnInit {
  @ViewChild("game")
  private gameCanvas: ElementRef;
  private gameRect: any;
  private context: any;
  private socket: any;
  private port: number = 3000;
  private gameLoop: any;
  private bgColor: string = "#5ED5F5";
  public playerName: string = "Dave";
  private displayedThings: Thing[] = [];
  private maxAge: number = 7500;
  private playerInput = false;

  points: number;
  highScore: number;

  private mousePos: any = {
    x: 0,
    y: 0
  };

  ngOnInit() {
    this.gameCanvas.nativeElement.width = document.body.clientWidth;
    this.gameCanvas.nativeElement.height = document.body.clientHeight;

    console.log(`Connecting to :${this.port}`);
    this.socket = io(`http://localhost:${this.port}`);
    this.startGame();
  }

  public enablePlayerInput() {
    this.playerInput = true;
  }

  public disablePlayerInput() {
    this.playerInput = false;
  }

  startGame() {
    this.startGameLoop();
    this.context = this.gameCanvas.nativeElement.getContext("2d");
    this.socket.on("points", points => {
      this.points = points;
    });
    this.socket.on("highScore", highScore => {
      this.highScore = highScore;
    });

    this.socket.on("thing-occurance", thing => {
      this.onThingHappen(thing);
    });
  }

  public startGameLoop() {
    this.gameLoop = setInterval(() => {
      this.clearCanvas();
      this.drawBackground();
      this.drawThings();
      this.drawUI();
      this.ageThings();
    }, 10);
  }

  public onThingHappen(thing: Thing) {
    console.log(
      `Found out thing happened from player ${thing.player}, they pressed ${thing.key}`
    );
    this.displayedThings.push(thing);
  }

  public clearCanvas() {
    this.context.clearRect(
      0,
      0,
      this.gameCanvas.nativeElement.width,
      this.gameCanvas.nativeElement.height
    );
  }

  public drawBackground() {
    this.context.fillStyle = this.bgColor;
    this.context.fillRect(
      0,
      0,
      this.gameCanvas.nativeElement.width,
      this.gameCanvas.nativeElement.height
    );
  }

  public drawThings() {
    for (const thing of this.displayedThings) {
      this.context.beginPath();
      this.context.arc(
        this.screenX(thing.x),
        this.screenY(thing.y),
        thing.age * 10,
        2 * Math.PI,
        false
      );
      this.context.fillStyle = thing.color;
      this.context.fill();
      this.context.font = "20px Kulim Park";
      this.context.fillStyle = "black";
      this.context.textAlign = "center";
      this.context.textBaseline = "middle";
      this.context.fillText(
        `${thing.player}: ${thing.key}`,
        this.screenX(thing.x),
        this.screenY(thing.y)
      );
    }
  }

  public drawUI() {
    this.context.fillStyle = "black";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.font = "32px Changa One";
    this.context.fillText(
      "Do Things, Get Points, With Friends",
      this.gameCanvas.nativeElement.width / 2,
      50
    );

    this.context.font = "64px Changa One";
    this.context.fillText(
      `Points: ${this.points}`,
      this.gameCanvas.nativeElement.width / 2,
      this.gameCanvas.nativeElement.height / 2
    );

    this.context.font = "30px Changa One";
    this.context.fillText(
      `High Score: ${this.highScore}`,
      this.gameCanvas.nativeElement.width / 2,
      this.gameCanvas.nativeElement.height / 2 + 50
    );
  }

  public ageThings() {
    var oldThings = [];
    for (const thing of this.displayedThings) {
      if (thing.age > this.maxAge) {
        oldThings.push(thing);
      } else {
        thing.age++;
      }
    }
    this.displayedThings = this.displayedThings.filter(
      obj =>
        this.displayedThings.indexOf(obj) == this.displayedThings.length - 1 ||
        !oldThings.includes(obj)
    );
  }

  @HostListener("document:keydown", ["$event"])
  public onKeyDown(event: KeyboardEvent) {
    if (!this.playerInput) return;
    const thing: Thing = {
      x: this.normalizedX(this.mousePos.x),
      y: this.normalizedY(this.mousePos.y),
      player: this.playerName,
      key: event.key,
      age: 0,
      color: this.randomColor()
    };
    this.socket.emit("thing", thing);
  }

  @HostListener("click", ["$event"])
  public onClick(event: MouseEvent) {
    if (!this.playerInput) {
      return;
    }
    const thing: Thing = {
      x: this.normalizedX(this.mousePos.x),
      y: this.normalizedY(this.mousePos.y),
      player: this.playerName,
      key: "Click",
      age: 0,
      color: this.randomColor()
    };
    this.socket.emit("thing", thing);
  }

  private screenX(x) {
    return x * this.gameCanvas.nativeElement.width;
  }

  private screenY(y) {
    return y * this.gameCanvas.nativeElement.height;
  }

  private normalizedX(x) {
    return x / this.gameCanvas.nativeElement.width;
  }

  private normalizedY(y) {
    return y / this.gameCanvas.nativeElement.height;
  }

  public getMousePos(evt) {
    var rect = this.gameCanvas.nativeElement.getBoundingClientRect();
    this.mousePos = {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  public randomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  public onResize(evt) {
    this.gameCanvas.nativeElement.width = document.body.clientWidth;
    this.gameCanvas.nativeElement.height = document.body.clientHeight;
  }
}

export class Thing {
  x: number;
  y: number;
  player: string;
  key: string;
  age: number = 0;
  color: string;
}
