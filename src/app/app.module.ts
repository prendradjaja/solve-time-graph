import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DebugPageComponent } from './debug-page/debug-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { GraphComponent } from './graph/graph.component';

@NgModule({
  declarations: [AppComponent, DebugPageComponent, HomePageComponent, GraphComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
