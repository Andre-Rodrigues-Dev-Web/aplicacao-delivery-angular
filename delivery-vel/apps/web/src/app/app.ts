import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '@delivery-vel/data';
import { computed, inject } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private cartService = inject(CartService);
  private router = inject(Router);

  // Signals para controle de estado
  private _showMobileMenu = signal(false);
  private _showUserMenu = signal(false);

  readonly showMobileMenu = this._showMobileMenu.asReadonly();
  readonly showUserMenu = this._showUserMenu.asReadonly();
  readonly cartItemsCount = computed(() => this.cartService.itemCount());

  toggleMobileMenu(): void {
    this._showMobileMenu.set(!this._showMobileMenu());
  }

  toggleUserMenu(): void {
    this._showUserMenu.set(!this._showUserMenu());
  }

  toggleCart(): void {
    this.router.navigate(['/cart']);
  }
}
