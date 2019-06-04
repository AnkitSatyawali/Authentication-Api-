import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
@Injectable({
	providedIn : 'root'
})
export class AuthService{
  constructor(private http : HttpClient,private router : Router) {}

  private isAuthenticated = false;
  private token : string;
  private userId : string;
  private tokenTimer : any;
  email : string;
  private authStatusListener = new Subject<boolean>()
  isAuth()
  {
     return this.isAuthenticated;
  }
  getAuthStatusListener()
  {
     return this.authStatusListener.asObservable();
  }
  createUser(email:string ,password: string)
  {
     
     const authData : AuthData = {email:email,password:password};
     this.http.post('http://localhost:3000/api/user/signup',authData)
     .subscribe(response => {
        console.log(response);
        this.router.navigate(['/login']);
     },error => {
        this.authStatusListener.next(false);
     });
  }
  login(email:string,password:string)
  {
     const logData:AuthData = {email:email,password:password};
     this.http.post<{token:string,expiresIn:number,userId:string}>('http://localhost:3000/api/user/login',logData)
     .subscribe(response => {
       this.token = response.token;
       if(this.token)
       {
          const expireDuration = response.expiresIn;
          this.setAuthTimer(expireDuration);
          console.log(expireDuration);
          this.isAuthenticated = true;
          this.userId = response.userId;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDur = new Date(now.getTime()+expireDuration*1000);
          this.saveAuthData(this.token,expirationDur,this.userId);
          this.router.navigate(['/']);

       }
     },error => {
       this.authStatusListener.next(false)
       ;
     });
  }
  logOut()
  {
     this.token = null;
     this.isAuthenticated = false;
     this.authStatusListener.next(false);
     clearTimeout(this.tokenTimer);
     this.userId = null;
     this.clearAuthData();
     this.router.navigate(['/']);
  } 
  getToken()
  {
     return this.token;
  }
  getUserId()
  {
     return this.userId;
  }
  private setAuthTimer(duration : number)
  {
     this.tokenTimer = setTimeout(() => {
        this.logOut();},duration*1000);
  }
  private saveAuthData(token:string,expirationDur:Date,userId:string)
  {
    localStorage.setItem("token",token);
    localStorage.setItem("expiration",expirationDur.toISOString());
    localStorage.setItem("userId",userId);
  }
	
  private clearAuthData() 
  {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");
  }
  
  
  autoAuthUser()
  {

    var token = localStorage.getItem("token");
    var expirationDur = new Date(localStorage.getItem("expiration"));
    var userId = localStorage.getItem("userId");
    
    if(!token || !expirationDur)
    {
      return;
    }
     const now = new Date();
     const expiresIn = expirationDur.getTime()-now.getTime();
     if(expiresIn>0)
     {
        this.token = token;
        this.isAuthenticated = true;
        this.userId = userId;
        this.setAuthTimer(expiresIn/1000);
        this.authStatusListener.next(true);
     }
  }
  userDetail()
  {
    var userId = localStorage.getItem("userId");
    if(!userId)
    return;
    return this.http.get<{email:string,counter:number}>('http://localhost:3000/api/user/'+userId);
  }
}