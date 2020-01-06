import { Component, ViewChild } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';
import { GameComponent } from './game/game.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('fade', [
      state('in', style({
        opacity: 1
      })),
      state('out', style({
        opacity: 0
      })),
      transition('in => out', [
        animate('1s')
      ]),
      transition('out => in', [
        animate('1s')
      ])
    ])
  ]
})
export class AppComponent {
  playing = false;
  inGame = false;
  player = "";

  @ViewChild(GameComponent)
  private game: GameComponent;

  beginGame() {
    if (this.playing) {
      this.inGame = true;
      this.game.playerName = this.player;
      this.game.enablePlayerInput();
    }
  }

  setPlayerName(evt) {
    console.log(evt);
    this.player = evt;
  }
}
