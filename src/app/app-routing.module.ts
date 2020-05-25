import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { DebugPageComponent } from './debug-page/debug-page.component';
import { SolvesDataResolverService } from './solves-data-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    resolve: { solves: SolvesDataResolverService },
  },
  {
    path: 'debug',
    component: DebugPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
