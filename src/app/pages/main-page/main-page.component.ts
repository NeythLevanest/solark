import { MapsAPILoader, MouseEvent } from '@agm/core';
import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { MapPageComponent } from '../map-page/map-page.component';
import { Coordenada } from '../../models/Coordenada';
import { RequestServicesService } from '../../services/request-services.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatosSolares } from '../../models/DatosSolares';



@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  @ViewChild('search')
  public searchElementRef!: ElementRef;

  latitude!:number;
  longitude!:number;
  zoom!:number;
  address!:string;
  addressList:any[] = [];
  cordenada!:Coordenada;
  formParameters:FormGroup;
  parameter!:DatosSolares;
  private geoCoder:any;

  



  constructor(
    private mapsAPILoader:MapsAPILoader,
    private ngZone:NgZone,
    public _requestNASA:RequestServicesService,
    public formBuilder:FormBuilder
  )
  {
    this.formParameters = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    })
  }

  ngOnInit(): void {
    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder;

      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place:google.maps.places.PlaceResult = autocomplete.getPlace();
          //this.place = autocomplete.getPlace();
          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;

          this.getAddress(this.latitude, this.longitude);
        });
      });
    });
  }


  public setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 15;
      });
    }
  }

  markerDragEnd($event: MouseEvent) {
    console.log($event);
    
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }

  getAddress(latitude:any, longitude:any) {
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results:any, status:any) => {
      localStorage.setItem('addressHistory', results[0]);
      console.log(results);
      console.log(status);
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 12;
          this.address = results[0].formatted_address;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });
  }
  procesarDatos()
  {

    let startDateTmp:string = this.formParameters.value.startDate;
    let endDateTmp:string = this.formParameters.value.endDate;
    
    let startDate;
    let endDate;


    startDate = startDateTmp.split("-")[0]+""+startDateTmp.split("-")[1]+startDateTmp.split("-")[2];
    endDate = endDateTmp.split("-")[0]+endDateTmp.split("-")[1]+endDateTmp.split("-")[2];
    
    console.log("BOTÓN SE EJECUTA")
    this.cordenada = new Coordenada(
      this.longitude,
      this.latitude,
      "daily",
      startDate,
      endDate
    );

    this._requestNASA.getRequest(this.cordenada.frecuencia, this.cordenada.long, this.cordenada.lat, this.cordenada.startDate, this.cordenada.endDate)
      .subscribe((resp:any)=>{
        this.parameter = resp.properties.parameter;
        console.log(this.parameter);
      });


  }

  saludar()
  {

    let startDateTmp:string = this.formParameters.value.startDate;
    let endDateTmp:string = this.formParameters.value.endDate;
    
    let startDate;
    let endDate;


    

    console.log(startDate);
    console.log(endDate)

    console.log("Hola mundo");
  }
}
