import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Coordenada } from 'src/app/models/Coordenada';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { RequestServicesService } from '../../services/request-services.service';


@Component({
  selector: 'app-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss']
})
export class MapPageComponent implements OnInit {

  @ViewChild('search')
  public searchElementRef!: ElementRef;

    
  cordenada!:Coordenada;
  ubicacionCentral!: Coordenada;
  ubicationSelected!: Coordenada;
  latitude!:number;
  longitude!:number;
  zoom!:number;
  address!:string;
  private geoCoder:any;

  coordenadas : Coordenada[] = [];

  constructor(
    private mapsAPILoader:MapsAPILoader,
    private ngZone:NgZone,
    public _requestNASA:RequestServicesService
  )
  {
  
  }

  ngOnInit(): void {
    //this.ubicacionCentral = new Coordenada(-1.8107958,-79.5041315, 14);
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
        });
      });
    });
  }


  mapClicked($event: MouseEvent) {
    //let coord = new Coordenada($event.coords.lat, $event.coords.lng, 12);
    //this.coordenadas.push(coord);
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

  
}
