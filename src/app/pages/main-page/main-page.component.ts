import { MapsAPILoader, MouseEvent } from '@agm/core';
import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
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

  /*Gráficas segmentadas por frecuencia*/
  chartDaily!:Chart;
  chartMensual!:Chart;
  chartAnual!:Chart;
  chartWeek!:Chart;
  chartPROM!:Chart;
  chartSAVE!:Chart;
  /*FIN Gráficas segmentadas por frecuencia*/
  
  /*Listas con datos procesados por frecuencia*/
  clavesAñoMesDia:any[]=[];
  valoresAñoMesDia:any[]=[];
  clavesT2MAñoMesDia:any[]=[];
  valoresT2MAñoMesDia:any[]=[];


  clavesAñoMes:any[]=[];
  valoresAñoMes:any[]=[];
  clavesT2MAñoMes:any[]=[];
  valoresT2MAñoMes:any[]=[];

  clavesAño:any[]=[];
  valoresAño:any[]=[];
  clavesT2MAño:any[]=[];
  valoresT2MAño:any[]=[];

  clavesSemana:any[]=[];
  valoresSemana:any[]=[];
  clavesT2MSemana:any[]=[];
  valoresT2MSemana:any[]=[];
  /*FIN Listas con datos procesados por frecuencia*/

 /*VARIABLES DE RESULTADO */
  potenciaMensual:number = 0;
  ahorroMensual:number = 0;
  potenciaMensualMáxima:number = 0;
  ahorroMensualMáxima:number = 0;
 /*VARIABLES DE RESULTADO */

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
    /*NO TOCAR - Método responsable de procesar la búsqueda de la barra de búsqueda del mapa */
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

  /*Método para asignar LATITUD y LONGITUD a variables globales*/
  public setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 15;
      });
    }
  }

  /*Método para asignar UN MARCADOR CON LATITUD y LONGITUD a variables globales AL DAR CLICK EN EL MAPA*/
  markerDragEnd($event: MouseEvent) {
    console.log($event);
    
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }

  
  /*Método para asignar OPTENER DIRECCIÓN*/
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

  
  /*Método para crear listas de Datos POR FRECUENCIA de IRRADIANCIA*/
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
        this.clavesT2MAñoMesDia = Object.keys(this.parameter.T2M);
        this.valoresT2MAñoMesDia = Object.values(this.parameter.T2M);

        console.log(this.valoresAñoMesDia);


        this.calculaPotenciaPromedioSolar(this.valoresAñoMesDia, this.valoresT2MAñoMesDia,);

        this.procesarDatosPorSemana()
        this.procesarDatosPorMes();
        this.procesarDatosPorAño();
        this.generateChartByWeek();
        this.generateChartPROM();

      },
      (error:any) => {
        alert('Error encontrado');
      });


  }



  /*Método para crear listas de Datos POR SEMANA de IRRADIANCIA*/
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


/*Método para crear listas de Datos POR MES de IRRADIANCIA*/
  procesarDatosPorMes()
  {
    this.clavesAñoMes = [];
    this.valoresAñoMes = [];

    this.clavesT2MAñoMes = [];
    this.valoresT2MAñoMes = [];

    let mesUno;
    let contador = 0;
    let flagControl = true;

    let contadorMensual = 0;
    let acumuladorMensual = 0;
    let mesDos;

    //IRRADIANCIA
    let clavesList = this.clavesAñoMesDia;
    let valoresList = this.valoresAñoMesDia;

    //TEMPERATURA
    let valoresT2MList = this.valoresT2MAñoMesDia;
    let acumuladorT2MMesnual = 0;

    let promedioMensual=0;
    let promedioMensulaT2M = 0;

    mesUno = clavesList[0].substr(0,6);

    while(contador < (clavesList.length-1) && flagControl)
    {
      mesDos = clavesList[contador].substr(0,6);
      while(mesUno == mesDos && flagControl)
      {
        contadorMensual +=1;
        acumuladorMensual +=valoresList[contador];
        acumuladorT2MMesnual +=valoresT2MList[contador];
        contador += 1;

        mesDos =  clavesList[contador].substr(0,6);
        if(contador == (clavesList.length - 1))
        {
          flagControl = false;
        }
      }
      promedioMensual = acumuladorMensual/contadorMensual;
      promedioMensulaT2M = acumuladorT2MMesnual/contadorMensual;
      
      this.clavesAñoMes.push(mesUno);
      this.clavesT2MAñoMes.push(mesUno);
      this.valoresAñoMes.push(promedioMensual);
      this.valoresT2MAñoMes.push(promedioMensulaT2M);
      mesUno = mesDos;

      contadorMensual = 0;
      acumuladorMensual = 0;
      acumuladorT2MMesnual = 0;
    }
    console.log(this.clavesAñoMes);
    console.log(this.valoresAñoMes);
  }

  /*Método para crear listas de Datos POR AÑO de IRRADIANCIA*/
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


  /*Método para crear GRÁFICO de Datos POR DÍA de IRRADIANCIA*/

  generateChartPROM()
  {
    this._chartService.mostrarCharByPROM();

    
    if(this.chartSAVE)
    {
      this.chartSAVE.destroy();
    }
    

    this.chartSAVE = new Chart('canvas5',{
      type:'bar',
      data: {
        labels:["Ahorro", "Máximo"],
        datasets:[
          {
            indexAxis:'y',
            label:"Ahorro Mensual",
            data: [this.ahorroMensual, this.ahorroMensualMáxima],
            
            backgroundColor:[
              'rgba(1, 51, 100, 0.8)',
              'rgba(245, 245, 245, 0.8)'
            ],
            borderColor:[
              'rgb(101, 255, 0)',
              'rgb(245, 245, 245)'
            ],
            
          }
        ]
      }
      
    });

    
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
                borderWidth:2,
                borderColor:"#3e95cd",
                fill:false
              }
             
            ]
          }
        });
        
  }
 /*Método para crear GRÁFICO de Datos POR SEMANA de IRRADIANCIA*/
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
                borderWidth:2,
                borderColor:"#3e95cd",
                fill:false
              }
             
            ]
          }
        });
  }

 /*Método para crear GRÁFICO de Datos POR MES de IRRADIANCIA*/
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
                borderWidth:2,
                borderColor:"#3e95cd",
                fill:false
              }
             
            ]
          }
        });
      
  }

   /*Método para crear GRÁFICO de Datos POR AÑO de IRRADIANCIA*/
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
                label:"Curva de Irradiancia por A",
                data:Object.values(this.valoresAño),
                borderWidth:2,
                borderColor:"#3e95cd",
                fill:false
              }
             
            ]
          }
        });
     
  }

   /*Método para OCULTAR GRÁFICOS AL DAR CLICK EN COLLAPSABLE O CUALQUIER OTRO LADO DESEADO*/
  ocultarGraficas()
  {
    this._chartService.ocultarCharByWeek();
    this._chartService.ocultarCharByMonth();
    this._chartService.ocultarCharByYear();
    this._chartService.ocultarCharByDay();
    this._chartService.ocultarCharByPROM();
  }



  calculaPotenciaPromedioSolar(irradiancia:number[], t2m:number[])
  {
    //

    const VPMAX_STC=40.0
    const IPMAX_STC=10.1
    const VOC_STC=48.7
    const ISC_STC=10.5
    const TEMP_STC=25
    const NOCT=44
    const TEMP_COEF_ISC=0.03
    const TEMP_COEF_IMP=-0.02
    const TEMP_COEF_VOC=-0.3
    const TEMP_COEF_VMP=-0.43
    const TEMP_COEF_PMAX=-0.38

    const T2M_RANGE=18.75
    const ALLSKY_SFC_SW_DWN=400

    //VARIABLES DE RESULTADO
    let tCELL = 0;
    let deltaT = 0;
    let vmpT = 0;
    let impT = 0;
    var potencia = 0;

    let tCELLMax = 0;
    let deltaTMax = 0;
    let vmpTMax = 0;
    let impTMax = 0;
    var potenciaMax = 0;

    //Cáculo de promedio
    let acumuladorIrradiancia = 0;
    let acumuladorT2M = 0;
    let promedioIrradiancia = 0;
    let promedioT2M = 0;

  

    console.log("lista irradiancia"+ irradiancia);
    for(let i=0; i<irradiancia.length; i++)
    {
      acumuladorIrradiancia +=irradiancia[i];
      acumuladorT2M         +=t2m[i];
    }
    console.log("acumulador Irradiancia:" + acumuladorIrradiancia);
    console.log("acumulador Temperatura:" + acumuladorT2M);

    promedioIrradiancia = acumuladorIrradiancia/(irradiancia.length);
    promedioT2M         = acumuladorT2M/(t2m.length);


    //T_CELL=T2M_RANGE+((NOCT-20)/(800))*ALLSKY_SFC_SW_DWN	               
    //PMP=((VMP*IMP)/100)*12*30
    tCELL = promedioT2M +((NOCT-20)/800)*promedioIrradiancia;
    deltaT = tCELL - TEMP_STC;
    vmpT  = VPMAX_STC*(1+((TEMP_COEF_VMP/100)*deltaT));
    impT = IPMAX_STC*(1+((TEMP_COEF_IMP/100)*deltaT));

    potencia = ((((vmpT*impT)/100)*12)*30);
    
    this.potenciaMensual = Number(potencia.toFixed(3));
    this.ahorroMensual = potencia*0.1;
    this.ahorroMensual = Number(this.ahorroMensual.toFixed(3));




    tCELLMax = Math.max.apply(null, t2m) +((NOCT-20)/800)*Math.max.apply(null, irradiancia);
    deltaTMax = tCELLMax - TEMP_STC;
    vmpTMax  = VPMAX_STC*(1+((TEMP_COEF_VMP/100)*deltaTMax));
    impTMax = IPMAX_STC*(1+((TEMP_COEF_IMP/100)*deltaTMax));

    potenciaMax = ((((vmpTMax*impTMax)/100)*12)*30);

    this.potenciaMensualMáxima = Number(potenciaMax.toFixed(3));;
    this.ahorroMensualMáxima = potenciaMax*0.1;
    this.ahorroMensualMáxima = Number(this.ahorroMensualMáxima.toFixed(3));;

    /*DELTA_T=T_CELL-TEMP_STC 		      		                #DELTA DE TEMPERATURA
    VMP=VPMAX_STC*(1+(TEMP_COEF_VMP/100)*DELTA_T) 		                #VOLTAJE DE MAXIMA POTENCIA
    IMP=IPMAX_STC*(1+(TEMP_COEF_IMP/100)*DELTA_T)		                #CORRIENTE DE MAXIMA POTENCIA
    PMP=((VMP*IMP)/100)*12*30						#PUNTO DE MAXIMA POTENCIA
    DOLLAR=PMP*0.1
    */
  }

}

