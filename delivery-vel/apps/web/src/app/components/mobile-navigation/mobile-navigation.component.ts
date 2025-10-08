import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@delivery-vel/data';
import { CartService } from '@delivery-vel/data';

@Component({
  selector: 'app-mobile-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="mobile-nav" *ngIf="isMobile()">
      <div class="nav-container">
        <a routerLink="/home" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          <span class="nav-label">Início</span>
        </a>

        <a routerLink="/menu" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span class="nav-label">Cardápio</span>
        </a>

        <a routerLink="/cart" routerLinkActive="active" class="nav-item cart-item">
          <div class="cart-icon-container">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span class="cart-badge" *ngIf="cartItemCount() > 0">{{ cartItemCount() }}</span>
          </div>
          <span class="nav-label">Carrinho</span>
        </a>

        <a routerLink="/orders" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
          <span class="nav-label">Pedidos</span>
        </a>

        <a *ngIf="isAuthenticated()" routerLink="/profile" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span class="nav-label">Perfil</span>
        </a>

        <a *ngIf="!isAuthenticated()" routerLink="/auth/login" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10,17 15,12 10,7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          <span class="nav-label">Entrar</span>
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .mobile-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 1px solid #e5e7eb;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      padding-bottom: env(safe-area-inset-bottom);
    }

    .nav-container {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 8px 16px;
      max-width: 100%;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      color: #6b7280;
      transition: color 0.2s ease;
      padding: 8px 4px;
      min-width: 60px;
      position: relative;
    }

    .nav-item.active {
      color: #84cc16;
    }

    .nav-item:hover {
      color: #84cc16;
    }

    .nav-icon {
      width: 24px;
      height: 24px;
      margin-bottom: 4px;
    }

    .nav-label {
      font-size: 10px;
      font-weight: 500;
      text-align: center;
      line-height: 1.2;
    }

    .cart-icon-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cart-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #ef4444;
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      min-width: 18px;
    }

    @media (min-width: 768px) {
      .mobile-nav {
        display: none;
      }
    }
  `]
})
export class MobileNavigationComponent {
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly cartItemCount = computed(() => this.cartService.itemCount());

  isMobile(): boolean {
    return window.innerWidth < 768;
  }
}