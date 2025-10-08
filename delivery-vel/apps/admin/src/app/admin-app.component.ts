import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="admin-layout">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AdminAppComponent {
  title = 'Delivery Admin Panel';
}