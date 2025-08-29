import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [AppComponent],
  imports: [CommonModule, RouterModule],
  exports: [AppComponent]  // exported so shell can use them
})
export class PokemonModule {}
