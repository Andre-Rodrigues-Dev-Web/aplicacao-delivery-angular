import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService, CartService } from '@delivery-vel/data';
import { CartComponent } from './pages/cart/cart.component';
import { MobileNavigationComponent } from './components/mobile-navigation/mobile-navigation.component';
import { MobileFeaturesComponent } from './components/mobile-features/mobile-features.component';
import { ChatComponent } from './components/chat/chat.component';
import { computed } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, CartComponent, MobileNavigationComponent, MobileFeaturesComponent, ChatComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);

  // Signals para controle de estado
  private _showMobileMenu = signal(false);
  private _showUserMenu = signal(false);
  private _isCartOpen = signal(false);
  private _isChatOpen = signal(false);

  readonly showMobileMenu = this._showMobileMenu.asReadonly();
  readonly showUserMenu = this._showUserMenu.asReadonly();
  readonly isCartOpen = this._isCartOpen.asReadonly();
  readonly isChatOpen = this._isChatOpen.asReadonly();
  readonly cartItemsCount = computed(() => this.cartService.itemCount());

  ngOnInit(): void {
    // Verificar se o chat deve ser aberto após compra
    const openChat = sessionStorage.getItem('openChat');
    if (openChat === 'true') {
      this._isChatOpen.set(true);
      sessionStorage.removeItem('openChat');
    }
  }

  toggleMobileMenu(): void {
    this._showMobileMenu.set(!this._showMobileMenu());
  }

  toggleUserMenu(): void {
    this._showUserMenu.set(!this._showUserMenu());
  }

  toggleCart(): void {
    this._isCartOpen.set(!this._isCartOpen());
  }

  closeCart(): void {
    this._isCartOpen.set(false);
  }

  toggleChat(): void {
    this._isChatOpen.set(!this._isChatOpen());
  }

  closeChat(): void {
    this._isChatOpen.set(false);
  }
}
