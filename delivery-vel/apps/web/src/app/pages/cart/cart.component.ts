import { Component, OnInit, Input, Output, EventEmitter, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '@delivery-vel/data';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Cart Sidebar Overlay -->
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-hidden">
      <!-- Background Overlay -->
      <div class="absolute inset-0 bg-black bg-opacity-50" (click)="onClose()"></div>
      
      <!-- Sidebar -->
      <div class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 class="text-lg font-semibold text-neutral-900">Meu Carrinho</h2>
          <button (click)="onClose()" class="p-2 hover:bg-neutral-100 rounded-full">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Cart Content -->
        <div class="flex flex-col h-full">
          <!-- Items List -->
          <div class="flex-1 overflow-y-auto p-4">
            <!-- Carrinho Vazio -->
            @if (cartItems().length === 0) {
              <div class="text-center py-8">
                <svg class="w-16 h-16 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13l-1.1 5m0 0h9.2M6 21a1 1 0 100-2 1 1 0 000 2zm12 0a1 1 0 100-2 1 1 0 000 2z"/>
                </svg>
                <h3 class="text-lg font-medium text-neutral-700 mb-2">Carrinho vazio</h3>
                <p class="text-neutral-500 text-sm mb-4">Adicione produtos ao seu carrinho</p>
                <button (click)="onClose()" routerLink="/menu" 
                        class="bg-brand-lime text-neutral-900 px-4 py-2 rounded-lg font-medium hover:bg-brand-olive transition-colors">
                  Ver Cardápio
                </button>
              </div>
            }

            <!-- Itens do Carrinho -->
            @if (cartItems().length > 0) {
              <div class="space-y-4">
                @for (item of cartItems(); track item.id) {
                  <div class="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                    <!-- Imagem do Produto -->
                    <img [src]="item.product.image" [alt]="item.product.name" 
                         class="w-12 h-12 rounded-lg object-cover flex-shrink-0">
                    
                    <!-- Informações do Produto -->
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-medium text-neutral-900 truncate">{{ item.product.name }}</h4>
                      <p class="text-sm text-brand-red font-medium">R$ {{ item.product.price.toFixed(2) }}</p>
                      @if (item.options) {
                        <p class="text-xs text-neutral-500 truncate">{{ getOptionsText(item.options) }}</p>
                      }
                    </div>
                    
                    <!-- Controles de Quantidade -->
                    <div class="flex items-center space-x-2">
                      <button (click)="updateQuantity(item.id, item.quantity - 1)"
                              [disabled]="item.quantity <= 1"
                              class="w-6 h-6 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 disabled:opacity-50">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                        </svg>
                      </button>
                      
                      <span class="text-sm font-medium min-w-[1.5rem] text-center">{{ item.quantity }}</span>
                      
                      <button (click)="updateQuantity(item.id, item.quantity + 1)"
                              class="w-6 h-6 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                      </button>
                    </div>
                    
                    <!-- Botão Remover -->
                    <button (click)="removeItem(item.id)" class="text-brand-red hover:text-red-700 p-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Footer com Resumo e Botões -->
          @if (cartItems().length > 0) {
            <div class="border-t border-neutral-200 p-4 bg-white">
              <!-- Resumo -->
              <div class="space-y-2 mb-4">
                <div class="flex justify-between text-sm text-neutral-600">
                  <span>Subtotal ({{ totalItems() }} {{ totalItems() === 1 ? 'item' : 'itens' }})</span>
                  <span>R$ {{ subtotal().toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm text-neutral-600">
                  <span>Taxa de entrega</span>
                  <span>R$ {{ deliveryFee().toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-base font-semibold text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span>R$ {{ total().toFixed(2) }}</span>
                </div>
              </div>
              
              <!-- Botões -->
              <div class="space-y-2">
                <button (click)="proceedToPayment()"
                        class="w-full bg-brand-lime text-neutral-900 py-3 px-4 rounded-lg font-semibold hover:bg-brand-olive transition-colors">
                  Finalizar Pedido
                </button>
                <button (click)="onClose()" routerLink="/menu"
                        class="w-full text-center text-neutral-600 py-2 px-4 rounded-lg hover:text-neutral-900 transition-colors">
                  Continuar Comprando
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  private cartService = inject(CartService);
  private router = inject(Router);

  // Signals computados do carrinho
  readonly cart = this.cartService.cart;
  readonly cartItems = computed(() => this.cart().items);
  readonly subtotal = computed(() => this.cartService.subtotal());
  readonly deliveryFee = computed(() => this.cartService.deliveryFee());
  readonly total = computed(() => this.cartService.total());
  readonly totalItems = computed(() => this.cartService.itemCount());

  ngOnInit(): void {
    // Componente inicializado - dados já estão disponíveis via signals
  }

  updateQuantity(itemId: string, newQuantity: number): void {
    if (newQuantity < 1) return;
    
    this.cartService.updateCartItem(itemId, { quantity: newQuantity }).subscribe({
      next: () => {
        // Item atualizado com sucesso
      },
      error: (error: any) => {
        console.error('Erro ao atualizar quantidade:', error);
        alert('Erro ao atualizar quantidade. Tente novamente.');
      }
    });
  }

  removeItem(itemId: string): void {
    if (confirm('Tem certeza que deseja remover este item do carrinho?')) {
      this.cartService.removeFromCart(itemId).subscribe({
        next: () => {
          // Item removido com sucesso
        },
        error: (error: any) => {
          console.error('Erro ao remover item:', error);
          alert('Erro ao remover item. Tente novamente.');
        }
      });
    }
  }

  clearCart(): void {
    if (confirm('Tem certeza que deseja limpar todo o carrinho?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          // Carrinho limpo com sucesso
        },
        error: (error: any) => {
          console.error('Erro ao limpar carrinho:', error);
          alert('Erro ao limpar carrinho. Tente novamente.');
        }
      });
    }
  }

  proceedToPayment(): void {
    if (this.cartItems().length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }
    
    this.router.navigate(['/payment']);
  }

  onClose(): void {
    this.close.emit();
  }

  getOptionsText(options: { [key: string]: string }): string {
    if (!options || Object.keys(options).length === 0) {
      return '';
    }
    
    return Object.entries(options)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }
}