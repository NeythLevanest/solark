import { MapsAPILoader, MouseEvent } from '@agm/core';
import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { MapPageComponent } from '../map-page/map-page.component';
import { Coordenada } from '../../models/Coordenada';
import { RequestServicesService } from '../../services/request-services.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatosSolares } from '../../models/DatosSolares';
import { Chart, registerables } from 'chart.js';
import { ChartService } from './chart.services.service';




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

  chartDaily!:Chart;
  chartMensual!:Chart;
  chartAnual!:Chart;
  chartWeek!:Chart;
  
  clavesAñoMesDia:any[]=[];
  valoresAñoMesDia:any[]=[];

  clavesAñoMes:any[]=[];
  valoresAñoMes:any[]=[];

  clavesAño:any[]=[];
  valoresAño:any[]=[];

  clavesSemana:any[]=[];
  valoresSemana:any[]=[];

  constructor(
    private mapsAPILoader:MapsAPILoader,
    private ngZone:NgZone,
    public _requestNASA:RequestServicesService,
    public _chartService:ChartService,
    public formBuilder:FormBuilder
  )
  {
    this.formParameters = this.formBuilder.group({
      startDate: ['2020-01-01', Validators.required],
      endDate: ['2020-12-31', Validators.required],
    });
    Chart.register(...registerables)
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

        this.clavesAñoMesDia = Object.keys(this.parameter.ALLSKY_SFC_SW_DWN);
        this.valoresAñoMesDia = Object.values(this.parameter.ALLSKY_SFC_SW_DWN);
        
        this.procesarDatosPorSemana()
        this.procesarDatosPorMes();
        this.procesarDatosPorAño();
        this.generateChartByWeek();

      },
      (error:any) => {
        alert('Error encontrado');
      });


  }

  procesarDatosPorSemana()
  {
    this.clavesSemana = [];
    this.valoresSemana = [];

    let semanaContador = 0;
    let diasContador = 0;
    let acumulador = 0;

    let clavesList = this.clavesAñoMesDia;
    let valoresList = this.valoresAñoMesDia;

    for(let i = 0; i<clavesList.length; i++)
    {
      acumulador += valoresList[i];
      diasContador +=1;
      if(diasContador == 7)
      {
        semanaContador +=1;
        this.clavesSemana.push(semanaContador);
        this.valoresSemana.push(acumulador/7);
        diasContador = 0;
        acumulador = 0;
      }
    }
    console.log(this.clavesSemana);
    console.log(this.valoresSemana);
  }



  procesarDatosPorMes()
  {
    this.clavesAñoMes = [];
    this.valoresAñoMes = [];

    let mesUno;
    let contador = 0;
    let flagControl = true;

    let contadorMensual = 0;
    let acumuladorMensual = 0;
    let mesDos;

    let clavesList = this.clavesAñoMesDia;
    let valoresList = this.valoresAñoMesDia;

    let promedioMensual=0;

    mesUno = clavesList[0].substr(0,6);

    while(contador < (clavesList.length-1) && flagControl)
    {
      mesDos = clavesList[contador].substr(0,6);
      while(mesUno == mesDos && flagControl)
      {
        contadorMensual +=1;
        acumuladorMensual +=valoresList[contador];
        contador += 1;

        mesDos =  clavesList[contador].substr(0,6);
        if(contador == (clavesList.length - 1))
        {
          flagControl = false;
        }
      }
      promedioMensual = acumuladorMensual/contadorMensual;
      this.clavesAñoMes.push(mesUno);
      this.valoresAñoMes.push(promedioMensual);
      mesUno = mesDos;

      contadorMensual = 0;
      acumuladorMensual = 0;
    }
    console.log(this.clavesAñoMes);
    console.log(this.valoresAñoMes);
  }

  procesarDatosPorAño()
  {
    this.clavesAño = [];
    this.valoresAño = [];

    let mesUno;
    let contador = 0;
    let flagControl = true;

    let contadorMensual = 0;
    let acumuladorMensual = 0;
    let mesDos;

    let clavesList = this.clavesAñoMesDia;
    let valoresList = this.valoresAñoMesDia;

    let promedioMensual=0;

    mesUno = clavesList[0].substr(0,4);

    while(contador < (clavesList.length-1) && flagControl)
    {
      mesDos = clavesList[contador].substr(0,4);
      while(mesUno == mesDos && flagControl)
      {
        contadorMensual +=1;
        acumuladorMensual +=valoresList[contador];
        contador += 1;

        mesDos =  clavesList[contador].substr(0,4);
        if(contador == (clavesList.length - 1))
        {
          flagControl = false;
        }
      }
      promedioMensual = acumuladorMensual/contadorMensual;
      this.clavesAño.push(mesUno);
      this.valoresAño.push(promedioMensual);
      mesUno = mesDos;

      contadorMensual = 0;
      acumuladorMensual = 0;
    }
    console.log(this.clavesAño);
    console.log(this.valoresAño);
  }

  generateChartByDay()
  {
    this._chartService.mostrarCharByDay();
    this._chartService.ocultarCharByMonth();
    this._chartService.ocultarCharByYear();
    this._chartService.ocultarCharByWeek();
    
    if(this.chartDaily)
    {
      this.chartDaily.destroy();
    }
    this.chartDaily = new Chart('canvas',{
          type:'line',
          data: {
            labels:Object.keys(this.clavesAñoMesDia),
            datasets:[
              {
                label:"Curva de Irradiancia por Día",
                data:Object.values(this.valoresAñoMesDia),
                borderWidth:1,
                fill:false
              }
             
            ]
          }
        });
        
  }

  generateChartByWeek()
  {
    this._chartService.mostrarCharByWeek();
    this._chartService.ocultarCharByMonth();
    this._chartService.ocultarCharByYear();
    this._chartService.ocultarCharByDay();

    if(this.chartDaily)
    {
      this.chartDaily.destroy();
    }
    this.chartDaily = new Chart('canvas3',{
          type:'line',
          data: {
            labels:Object.keys(this.clavesSemana),
            datasets:[
              {
                label:"Curva de Irradiancia por Semana",
                data:Object.values(this.valoresSemana),
                borderWidth:1,
                fill:false
              }
             
            ]
          }
        });
  }

  generateChartByMes()
  {
    this._chartService.mostrarCharByMonth();
    this._chartService.ocultarCharByDay();
    this._chartService.ocultarCharByYear();
    this._chartService.ocultarCharByWeek();

    if(this.chartMensual)
    {
      this.chartMensual.destroy();
    }
    this.chartMensual = new Chart('canvas1',{
          type:'line',
          data: {
            labels:Object.keys(this.clavesAñoMes),
            datasets:[
              {
                label:"Curva de Irradiancia por Mes",
                data:Object.values(this.valoresAñoMes),
                borderWidth:1,
                fill:false
              }
             
            ]
          }
        });
      
  }

  generateChartByAnio()
  {
    this._chartService.mostrarCharByYear();
    this._chartService.ocultarCharByDay();
    this._chartService.ocultarCharByMonth();
    this._chartService.ocultarCharByWeek();

    if(this.chartAnual)
    {
      this.chartAnual.destroy();
    }
    this.chartAnual = new Chart('canvas2',{
          type:'line',
          data: {
            labels:Object.keys(this.clavesAño),
            datasets:[
              {
                label:"Curva de Irradiancia por Año",
                data:Object.values(this.valoresAño),
                borderWidth:1,
                fill:false
              }
             
            ]
          }
        });
     
  }

  ocultarGraficas()
  {
    this._chartService.ocultarCharByWeek();
    this._chartService.ocultarCharByMonth();
    this._chartService.ocultarCharByYear();
    this._chartService.ocultarCharByDay();
  }
}
