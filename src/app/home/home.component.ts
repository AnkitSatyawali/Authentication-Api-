import { Component, OnInit,OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  email:string;
  counter:number;
  constructor(private authService : AuthService) { }
  private userIsAuthenticated = false;
  private authListenerSubs : Subscription;

  ngOnInit() {
    this.userIsAuthenticated = this.authService.isAuth();
     this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
       this.userIsAuthenticated = isAuthenticated;
     });
     if(this.userIsAuthenticated)
     {
       this.authService.userDetail().subscribe((user) => {this.email = user.email;
            this.counter = user.counter;});
     }
  }
  onLogOut()
  {
    this.authService.logOut();
  }
  ngOnDestroy() 
  {
    this.authListenerSubs.unsubscribe();
  }

}
