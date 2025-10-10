import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@org/core-services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'pokemon';
  isAuthenticated = false;
  userInfo: any = null;

  constructor(private auth: AuthService) {
    console.log("In pokemon constructor", this.auth.id);
  }

  ngOnInit(): void {
    console.log("IN ngOnInit of pokemon");
    this.isAuthenticated = this.auth.isAuthenticated();
    this.userInfo = this.auth.getUser();
    
    // Subscribe to user changes
    this.auth.user$.subscribe(user => {
      this.userInfo = user;
      this.isAuthenticated = !!user;
    });
  }

  login(): void {
    this.auth.login();
  }

  logout(): void {
    this.auth.logout();
  }
}
