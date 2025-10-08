import { Component, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('delivery-vel');
}
