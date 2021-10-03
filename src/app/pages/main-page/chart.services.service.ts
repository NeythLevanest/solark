import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  public hiddenModalBD:string='hiddenCharBD';
  public hiddenModalBW:string='hiddenCharBW';
  public hiddenModalBM:string='hiddenCharBM';
  public hiddenModalBY:string='hiddenCharBY';


  constructor() { }

  ocultarCharByDay() {
    this.hiddenModalBD = 'hiddenCharBD'; 
  }
  //value is empty
  mostrarCharByDay() {
    this.hiddenModalBD = ''; 
  }

  ocultarCharByWeek() {
    this.hiddenModalBW = 'hiddenCharBW'; 
  }
  //value is empty
  mostrarCharByWeek() {
    this.hiddenModalBW = ''; 
  }

  ocultarCharByMonth() {
    this.hiddenModalBM = 'hiddenCharBM'; 
  }
  //value is empty
  mostrarCharByMonth() {
    this.hiddenModalBM = ''; 
  }

  ocultarCharByYear() {
    this.hiddenModalBY = 'hiddenCharBY'; 
  }
  //value is empty
  mostrarCharByYear() {
    this.hiddenModalBY = ''; 
  }
}
