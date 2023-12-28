import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { loginRes } from './login/loginRes.model';
import { resetRes } from './reset-pass/reset-pass.model';
import { Router } from '@angular/router';

const BACK_END_URL = 'http://localhost:3000/api/register';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userId: string;
  private token: string;
  private authenticated: boolean = false;
  private authStatus = new Subject<boolean>();
  private cartItemsSubject = new BehaviorSubject<number>(0);
  cartItem$ = this.cartItemsSubject.asObservable();
  constructor(private http: HttpClient, private route: Router) {
    this.initialize();
  }

  private initialize() {
    // Initialization logic here
    this.getUserDataN();
    const userID = this.getUserID().userId;
    this.token = this.getUserID().token;
    if (userID != '' || userID != null) {
      this.authenticated = true;
    } else {
      this.authenticated = false;
    }

    if (this.authenticated) {
      this.token = this.getToken();
    }
  }

  addToCart() {
    const cartValue = this.cartItemsSubject.value;
    this.cartItemsSubject.next(cartValue + 1);
  }
  removeFromCart() {
    const cartValue = this.cartItemsSubject.value;
    if (cartValue > 0) {
      this.cartItemsSubject.next(cartValue - 1);
    }
  }

  getCartItemCount(): number {
    return this.cartItemsSubject.value;
  }

  getUserID() {
    return this.getLocalData();
  }
  getToken() {
    return this.token;
  }
  getTokenN(): Observable<any> {
    return this.getUserDataN().pipe(map(() => this.token));
  }

  getAuthStatus() {
    return this.authStatus.asObservable();
  }
  getAuthenticated() {
    return this.authenticated;
  }

  private SaveData(userId: string, token: string) {
    localStorage.setItem('userId', userId);
    localStorage.setItem('token', token);
  }

  private getLocalData() {
    // this.getTokenN().subscribe(() => {
    //   // var token = token;

    // });
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      return {
        userId: userId,
        token: token,
      };
  }

  private clearLocalData() {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
  }

  regirsterUser(
    name: string,
    email: string,
    password: string,
    image: string,
    type: string,
    mobile: string
  ) {
    const formData = new FormData();
    formData.append('name', name),
      formData.append('email', email),
      formData.append('password', password),
      formData.append('image', image),
      formData.append('type', type),
      formData.append('mobile', mobile);
    console.log('register service triggered', formData);

    this.http
      .post(BACK_END_URL, formData)
      .subscribe((data) => console.log(data));
  }

  loginUser(email: string, password: string) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    console.log('triggered login', formData);

    this.http
      .post<loginRes>('http://localhost:3000/api/login', { email, password })
      .subscribe({
        next: (res) => {
          console.log('login success', res);
          //user
          if (res.data.token && +res.data.type == 1) {
            this.userId = res.data._id;
            this.token = res.data.token;
            this.SaveData(this.userId, this.token);
            this.authenticated = true;
            this.authStatus.next(true);
            this.saveUserData();

            this.route.navigate(['/create-store']);
          } else {
            this.userId = res.data._id;
            this.token = res.data.token;
            this.SaveData(this.userId, this.token);
            this.authenticated = true;
            this.authStatus.next(true);
            this.saveUserData();
            // this.getUserData();
            this.route.navigate(['/user']);
          }
        },
        error: (error) => {
          console.log('error occured ');
          this.authenticated = false;
          this.authStatus.next(false);
        },
      });
  }

  logout() {
    this.token = null;
    this.authenticated = false;

    this.userId = null;
    this.clearAuthData();
    this.deleteCookie('uniqueUserId');
    // clearTimeout(this.tokenTimer);
    this.route.navigate(['/']);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  }

  forgetPassword(email: string) {
    console.log('email', email);
    this.http
      .post('http://localhost:3000/api/forget-password', { email })
      .subscribe((res) => {
        console.log('response', res);
      });
  }

  resetPassword(password: string, resetToken: string) {
    // const params = new HttpParams().set('token', resetToken);
    return this.http.post<resetRes>(
      `http://localhost:3000/api/reset-password?token=${resetToken}`,
      {
        password,
      }
    );
  }

  updatePassword(_id: string, password: string) {
    if (this.authenticated) {
      const headers = new HttpHeaders({
        authorization: this.token,
      });
      console.log('update Data head userid password', headers, _id, password);
      this.http
        .post(
          'http://localhost:3000/api/update-password',
          {
            _id,
            password,
          },
          { headers }
        )
        .subscribe((res) => console.log('Updated successfully', res));
    }
  }

  getUserAddress(): any {
    if (this.authenticated) {
      const userId = this.getLocalData().userId;
      const headers = new HttpHeaders({
        authorization: this.token,
      });
      const params = new HttpParams().set('user_id', userId);
      const options = {
        headers: headers,
        params: params,
      };
      return this.http.get('http://localhost:3000/api/get-address', options);
    }
  }

  addUserAddress(address: string): any {
    if (this.authenticated) {
      const userId = this.getLocalData().userId;
      const headers = new HttpHeaders({
        authorization: this.token,
      });
      const params = new HttpParams()
        .set('user_id', userId)
        .set('address', address);
      const options = {
        headers: headers,
        params: params,
      };
      return this.http.post(
        'http://localhost:3000/api/add-address',
        {},
        options
      );
    }
  }

  saveUserData() {
    if (this.authenticated) {
      const userId = this.getLocalData().userId;
      const token = this.getLocalData().token;
      const status = 'loggedIn';
      const headers = new HttpHeaders({
        authorization: this.token,
      });

      const options = {
        headers: headers,
      };
      return this.http
        .post<any>(
          'http://localhost:3000/api/saveUserData',
          { userId, token, status },
          options
        )
        .subscribe((res) => {
          console.log('addUserDatauserRes', res);
          const userID = res.data._id;
          // localStorage.setItem('uniqueUserId', userID);
          this.setCookie('uniqueUserId', userID, 1);
          console.log('unoiqueid cookeie', this.getCookie('uniqueUserId'));
        });
    } else {
      return null;
    }
  }

  getUserDataN(): Observable<any> {
    if (
      this.getCookie('uniqueUserId')
        ? this.getCookie('uniqueUserId') != ''
        : false || this.getCookie('uniqueUserId')
        ? this.getCookie('uniqueUserId') != null
        : false
    ) {
      const id = localStorage.getItem('uniqueUserId')
        ? localStorage.getItem('uniqueUserId')
        : this.getCookie('uniqueUserId');

      var token = this.getLocalData().token;
      var userId = this.getLocalData().userId;
      console.log('token 123', token, 'userID', userId, 'ID', id);
      if (token == '' || userId == '' || token == null || userId == null) {
        console.log('inside if $$');
        return this.http
          .get<any>(`http://localhost:3000/api/getUserData?id=${id}`)
          .pipe(
            map((res) => {
              this.token = res.data.token;
              this.userId = res.data.user_id;
              this.SaveData(this.userId, this.token);
              console.log('getUserDatauserRes$$', res);
              return res;
            })
          );
      } else {
        this.token = token;
        this.userId = userId;
        return of(token);
      }
    } else {
      return of(null);
    }
  }
  // getUserData(): any {
  //   if (
  //     this.getCookie('uniqueUserId')
  //       ? this.getCookie('uniqueUserId') != ''
  //       : false || this.getCookie('uniqueUserId')
  //       ? this.getCookie('uniqueUserId') != null
  //       : false || localStorage.getItem('uniqueUserId')
  //       ? localStorage.getItem('uniqueUserId') != ''
  //       : false || localStorage.getItem('uniqueUserId')
  //       ? localStorage.getItem('uniqueUserId') != null
  //       : false
  //   ) {
  //     const id = localStorage.getItem('uniqueUserId')
  //       ? localStorage.getItem('uniqueUserId')
  //       : this.getCookie('uniqueUserId');
  //     console.log('inside id ', id);
  //     this.http
  //       .get<any>(`http://localhost:3000/api/getUserData?id=${id}`)
  //       .subscribe((res) => {
  //         (this.token = res.data.token), (this.userId = res.data.user_id);
  //         this.SaveData(this.userId, this.token);
  //         console.log('getUserDatauserRes', res);
  //       });
  //   }
  // }
  setCookie(name: string, value: string, days: number): void {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    const cookieValue =
      encodeURIComponent(name) +
      '=' +
      encodeURIComponent(value) +
      '; expires=' +
      expirationDate.toUTCString() +
      '; path=/; secure';
    document.cookie = cookieValue;
  }

  getCookie(name: string): string | null {
    const decodedName = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(decodedName) === 0) {
        return decodeURIComponent(
          cookie.substring(decodedName.length, cookie.length)
        );
      }
    }

    return null;
  }
  updateCookie(name: string, value: string, days: number): void {
    this.setCookie(name, value, days);
  }
  deleteCookie(name: string) {
    document.cookie =
      name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}
