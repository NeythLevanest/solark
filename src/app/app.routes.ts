import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { MetricsPageComponent } from './pages/metrics-page/metrics-page.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
const app_routes: Routes =[
    {path:'signin', component:SignInComponent},
    {path:'app', component:MainPageComponent, 
        children:[
            {path:'metrics', component:MetricsPageComponent},
            {path:'info', component:MetricsPageComponent},
            

        ]


    },
    
];

export const app_routing = RouterModule.forRoot(app_routes,{useHash: true});