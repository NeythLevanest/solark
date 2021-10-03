import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import URL_SERVICIOS from '../config/config';




@Injectable({
  providedIn: 'root'
})
export class RequestServicesService {

  constructor(
    public http: HttpClient,
    public router: Router,
  ) {

  }


  getRequest(){
    let httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'JWT '/*+.getToken()*/,
      })
    }
    let url=URL_SERVICIOS.request;/*.lenderprofileList*//*;*/
    return this.http.get(url, httpOptions);

  }


}
