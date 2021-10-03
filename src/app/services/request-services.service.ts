import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import URL_SERVICIOS from '../config/config';
import { Observable } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class RequestServicesService {

  constructor(
    public http: HttpClient,
    public router: Router,
  ) {

  }


  getRequest(frecuencia:any, long:any, lat:any, startDate:any, endDate:any):Observable<any>{
    let httpOptions = {
      headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://power.larc.nasa.gov',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
      'Authorization': 'Bearer szdp79a2kz4wh4frjzuqu4sz6qeth8m3',
      })
    }
    //let url="/api/temporal/"+frecuencia+"/point?parameters=ALLSKY_SFC_SW_DWN,ALLSKY_KT,T2M&community=RE&longitude="+long+"&latitude="+lat+"&start="+startDate+"&end="+endDate+"&format=JSON"
    let url="https://power.larc.nasa.gov/api/temporal/"+frecuencia+"/point?parameters=ALLSKY_SFC_SW_DWN,ALLSKY_KT,T2M&community=RE&longitude="+long+"&latitude="+lat+"&start="+startDate+"&end="+endDate+"&format=JSON"
    console.log(url);
    return this.http.get(url, httpOptions);

  }


}
