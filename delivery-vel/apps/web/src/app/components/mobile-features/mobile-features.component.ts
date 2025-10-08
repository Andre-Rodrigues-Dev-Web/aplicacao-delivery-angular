import { Component, OnInit, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mobile-features',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Pull to Refresh Indicator -->
    @if (isPullToRefresh()) {
      <div class="pull-to-refresh">
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-red"></div>
          <span class="ml-2">Atualizando...</span>
        </div>
      </div>
    }

    <!-- Mobile Quick Actions -->
    <div class="mobile-quick-actions md:hidden fixed top-20 right-4 z-40">
      <div class="flex flex-col gap-3">
        <!-- Quick Order Button -->
        <button 
          (click)="quickOrder()"
          class="w-12 h-12 bg-brand-red text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors"
          title="Pedido Rápido"
        >
          <span class="text-lg">🍕</span>
        </button>

        <!-- Location Button -->
        <button 
          (click)="getCurrentLocation()"
          class="w-12 h-12 bg-brand-olive text-neutral-900 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-colors"
          title="Minha Localização"
        >
          <span class="text-lg">📍</span>
        </button>

        <!-- Support Button -->
        <button 
          (click)="openSupport()"
          class="w-12 h-12 bg-brand-lime text-neutral-900 rounded-full shadow-lg flex items-center justify-center hover:bg-lime-600 transition-colors"
          title="Suporte"
        >
          <span class="text-lg">💬</span>
        </button>
      </div>
    </div>

    <!-- Mobile Search Bar -->
    <div class="mobile-search md:hidden sticky top-16 z-30 bg-white shadow-sm p-4">
      <div class="relative">
        <input
          type="text"
          placeholder="Buscar pratos, restaurantes..."
          class="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          [(ngModel)]="searchQuery"
          (input)="onSearch()"
        >
        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 text-lg">🔍</span>
      </div>
    </div>

    <!-- Offline Indicator -->
    @if (!isOnline()) {
      <div class="offline-indicator fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
        <span class="text-sm">📶 Você está offline. Algumas funcionalidades podem não estar disponíveis.</span>
      </div>
    }

    <!-- Mobile Notifications -->
    @if (notifications().length > 0) {
      <div class="mobile-notifications fixed top-20 left-4 right-4 z-50 md:hidden">
        @for (notification of notifications(); track notification.id) {
          <div 
            class="bg-white border-l-4 border-brand-red p-4 mb-2 rounded-r-lg shadow-lg animate-slide-in"
            [class.border-green-500]="notification.type === 'success'"
            [class.border-yellow-500]="notification.type === 'warning'"
            [class.border-red-500]="notification.type === 'error'"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-lg mr-2">
                  @switch (notification.type) {
                    @case ('success') { ✅ }
                    @case ('warning') { ⚠️ }
                    @case ('error') { ❌ }
                    @default { 📢 }
                  }
                </span>
                <div>
                  <p class="font-medium text-neutral-900">{{ notification.title }}</p>
                  <p class="text-sm text-neutral-600">{{ notification.message }}</p>
                </div>
              </div>
              <button 
                (click)="dismissNotification(notification.id)"
                class="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>
          </div>
        }
      </div>
    }

    <!-- Mobile Swipe Hint -->
    @if (showSwipeHint()) {
      <div class="swipe-hint fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm z-40 md:hidden">
        👆 Deslize para navegar entre as seções
      </div>
    }
  `,
  styles: [`
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .mobile-quick-actions button {
      backdrop-filter: blur(10px);
    }

    .swipe-hint {
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0) translateX(-50%);
      }
      40% {
        transform: translateY(-10px) translateX(-50%);
      }
      60% {
        transform: translateY(-5px) translateX(-50%);
      }
    }
  `]
})
export class MobileFeaturesComponent implements OnInit {
  private router = inject(Router);

  // Signals for reactive state
  isPullToRefresh = signal(false);
  isOnline = signal(navigator.onLine);
  searchQuery = signal('');
  showSwipeHint = signal(false);
  notifications = signal<MobileNotification[]>([]);

  // Touch handling for pull-to-refresh
  private startY = 0;
  private currentY = 0;
  private pullDistance = 0;
  private isPulling = false;

  ngOnInit() {
    // Show swipe hint for new users
    setTimeout(() => {
      if (this.isFirstVisit()) {
        this.showSwipeHint.set(true);
        setTimeout(() => this.showSwipeHint.set(false), 5000);
      }
    }, 2000);

    // Listen for online/offline events
    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));

    // Request notification permission
    this.requestNotificationPermission();
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (window.scrollY === 0) {
      this.startY = event.touches[0].clientY;
      this.isPulling = true;
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.isPulling) return;

    this.currentY = event.touches[0].clientY;
    this.pullDistance = this.currentY - this.startY;

    if (this.pullDistance > 0 && this.pullDistance < 100) {
      event.preventDefault();
    }

    if (this.pullDistance > 80) {
      this.isPullToRefresh.set(true);
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    if (!this.isPulling) return;

    this.isPulling = false;

    if (this.pullDistance > 80) {
      this.performRefresh();
    } else {
      this.isPullToRefresh.set(false);
    }

    this.pullDistance = 0;
  }

  private performRefresh() {
    // Simulate refresh action
    setTimeout(() => {
      this.isPullToRefresh.set(false);
      this.showNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Atualizado!',
        message: 'Conteúdo atualizado com sucesso'
      });
      
      // Reload current page data
      window.location.reload();
    }, 1500);
  }

  quickOrder() {
    // Navigate to quick order or show quick order modal
    this.router.navigate(['/menu'], { queryParams: { quick: 'true' } });
    this.showNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'Pedido Rápido',
      message: 'Selecione seus pratos favoritos!'
    });
  }

  getCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.showNotification({
            id: Date.now().toString(),
            type: 'success',
            title: 'Localização encontrada!',
            message: 'Mostrando restaurantes próximos'
          });
          
          // Here you would typically update the location in a service
          console.log('Location:', { latitude, longitude });
        },
        (error) => {
          this.showNotification({
            id: Date.now().toString(),
            type: 'error',
            title: 'Erro de localização',
            message: 'Não foi possível obter sua localização'
          });
        }
      );
    } else {
      this.showNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Geolocalização não suportada',
        message: 'Seu dispositivo não suporta geolocalização'
      });
    }
  }

  openSupport() {
    // Open support chat or navigate to support page
    this.showNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'Suporte',
      message: 'Como podemos ajudar você hoje?'
    });
    
    // You could open a chat widget or navigate to support
    // this.router.navigate(['/support']);
  }

  onSearch() {
    const query = this.searchQuery();
    if (query.length > 2) {
      // Perform search
      this.router.navigate(['/menu'], { queryParams: { search: query } });
    }
  }

  private requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.showNotification({
            id: Date.now().toString(),
            type: 'success',
            title: 'Notificações ativadas!',
            message: 'Você receberá atualizações sobre seus pedidos'
          });
        }
      });
    }
  }

  showNotification(notification: MobileNotification) {
    const currentNotifications = this.notifications();
    this.notifications.set([...currentNotifications, notification]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      this.dismissNotification(notification.id);
    }, 5000);
  }

  dismissNotification(id: string) {
    const currentNotifications = this.notifications();
    this.notifications.set(currentNotifications.filter(n => n.id !== id));
  }

  private isFirstVisit(): boolean {
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      localStorage.setItem('hasVisitedBefore', 'true');
      return true;
    }
    return false;
  }
}

interface MobileNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}