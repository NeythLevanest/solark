import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  router: any;

  constructor() { }

  ngOnInit(): void {
  }

  goToHomeBack()
  {
    this.router.navigate(["/app"]);
  }
  goToHistory()
  {
    this.router.navigate(["/history"]);
  }
}
