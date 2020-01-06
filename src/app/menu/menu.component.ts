import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  name: string = "";
  unver = false;

  @Output() pName: EventEmitter<string> = new EventEmitter();
  @Output() playing: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  onPlay() {
    if (!this.name) {
      this.unver = true;
    } else {
      this.unver = false;
      this.pName.emit(this.name);
      this.playing.emit(true);
    }
  }

}
