import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { MetricsPageComponent } from './pages/metrics-page/metrics-page.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SeachHistoryComponent } from './pages/seach-history/seach-history.component';
const app_routes: Routes =[
    {path:'signin', component:SignInComponent},
    {path:'app', component:MainPageComponent}, 
    {path:'history', component:SeachHistoryComponent},
    {path:'', pathMatch:'full', redirectTo:'app'},
    {path:'**', pathMatch:'full', redirectTo:'app'}
    
];

export const app_routing = RouterModule.forRoot(app_routes,{useHash: true});