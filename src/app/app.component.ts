import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@org/core-services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'pokemon';
  constructor(private auth:AuthService){
    console.log("In pokemon constructor",this.auth.id)
  }
  ngOnInit(): void {
      console.log("IN ngOnInit of pokemon")
  }
}
