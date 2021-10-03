import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapPageComponent } from './pages/map-page/map-page.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { AgmCoreModule } from '@agm/core';
import { app_routing } from './app.routes';
import { MetricsPageComponent } from './pages/metrics-page/metrics-page.component';
import { MetricsResultsComponent } from './pages/metrics-results/metrics-results.component';
import { NavBarComponent } from './shared/nav-bar/nav-bar.component';
import { SeachHistoryComponent } from './pages/seach-history/seach-history.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { WrapCollapsibleComponent } from './pages/wrap-collapsible/wrap-collapsible.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    MapPageComponent,
    MainPageComponent,
    MetricsPageComponent,
    MetricsResultsComponent,
    NavBarComponent,
    SeachHistoryComponent,
    SignInComponent,
    WrapCollapsibleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AgmCoreModule.forRoot({apiKey: "AIzaSyBidxKo98boZOfCM2l9Y8qmPL2MNJguKwc", libraries: ['places']}),
    app_routing
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
