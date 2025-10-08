import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService, Cart, CartItem } from '@delivery-vel/data';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-light">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-900 mb-2">Meu Carrinho</h1>
          <p class="text-neutral-600">Revise seus itens antes de finalizar o pedido</p>
        </div>

        <!-- Carrinho Vazio -->
        @if (cartItems().length === 0) {
          <div class="bg-white rounded-lg shadow-sm p-8 text-center">
            <div class="mb-6">
              <svg class="w-24 h-24 mx-auto text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13l-1.1 5m0 0h9.2M6 21a1 1 0 100-2 1 1 0 000 2zm12 0a1 1 0 100-2 1 1 0 000 2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-neutral-700 mb-2">Seu carrinho está vazio</h3>
            <p class="text-neutral-500 mb-6">Adicione alguns produtos deliciosos ao seu carrinho</p>
            <a routerLink="/menu" 
               class="bg-brand-lime text-neutral-900 px-6 py-3 rounded-lg font-semibold hover:bg-brand-olive transition-colors inline-block">
              Ver Cardápio
            </a>
          </div>
        }

        <!-- Itens do Carrinho -->
        @if (cartItems().length > 0) {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Lista de Itens -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <div class="p-6 border-b border-neutral-200">
                  <h2 class="text-lg font-semibold text-neutral-900">Itens do Pedido</h2>
                </div>
                
                <div class="divide-y divide-neutral-200">
                  @for (item of cartItems(); track item.id) {
                    <div class="p-6 flex items-center space-x-4">
                      <!-- Imagem do Produto -->
                      <div class="flex-shrink-0">
                        <img [src]="item.product.image" [alt]="item.product.name" 
                             class="w-16 h-16 rounded-lg object-cover">
                      </div>
                      
                      <!-- Informações do Produto -->
                      <div class="flex-1 min-w-0">
                        <h3 class="text-lg font-medium text-neutral-900 truncate">{{ item.product.name }}</h3>
                        <p class="text-brand-red font-semibold">R$ {{ item.product.price.toFixed(2) }}</p>
                        @if (item.options) {
                          <p class="text-sm text-neutral-500 mt-1">
                            Opções: {{ getOptionsText(item.options) }}
                          </p>
                        }
                        @if (item.notes) {
                          <p class="text-sm text-neutral-500 mt-1">
                            Observações: {{ item.notes }}
                          </p>
                        }
                      </div>
                      
                      <!-- Controles de Quantidade -->
                      <div class="flex items-center space-x-3">
                        <button (click)="updateQuantity(item.id, item.quantity - 1)"
                                [disabled]="item.quantity <= 1"
                                class="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                          </svg>
                        </button>
                        
                        <span class="text-lg font-medium min-w-[2rem] text-center">{{ item.quantity }}</span>
                        
                        <button (click)="updateQuantity(item.id, item.quantity + 1)"
                                class="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                          </svg>
                        </button>
                      </div>
                      
                      <!-- Subtotal do Item -->
                      <div class="text-right">
                        <p class="text-lg font-semibold text-neutral-900">
                          R$ {{ (item.product.price * item.quantity).toFixed(2) }}
                        </p>
                      </div>
                      
                      <!-- Botão Remover -->
                      <button (click)="removeItem(item.id)"
                              class="text-brand-red hover:text-red-700 p-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  }
                </div>
              </div>
            </div>
            
            <!-- Resumo do Pedido -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 class="text-lg font-semibold text-neutral-900 mb-4">Resumo do Pedido</h2>
                
                <div class="space-y-3 mb-6">
                  <div class="flex justify-between text-neutral-600">
                    <span>Subtotal ({{ totalItems() }} {{ totalItems() === 1 ? 'item' : 'itens' }})</span>
                    <span>R$ {{ subtotal().toFixed(2) }}</span>
                  </div>
                  
                  <div class="flex justify-between text-neutral-600">
                    <span>Taxa de entrega</span>
                    <span>R$ {{ deliveryFee().toFixed(2) }}</span>
                  </div>
                  
                  <hr class="border-neutral-200">
                  
                  <div class="flex justify-between text-lg font-semibold text-neutral-900">
                    <span>Total</span>
                    <span>R$ {{ total().toFixed(2) }}</span>
                  </div>
                </div>
                
                <!-- Botões de Ação -->
                <div class="space-y-3">
                  <button (click)="proceedToPayment()"
                          class="w-full bg-brand-lime text-neutral-900 py-3 px-4 rounded-lg font-semibold hover:bg-brand-olive transition-colors">
                    Confirmar Compra
                  </button>
                  
                  <button (click)="clearCart()"
                          class="w-full border border-brand-red text-brand-red py-3 px-4 rounded-lg font-semibold hover:bg-brand-red hover:text-white transition-colors">
                    Cancelar Compra
                  </button>
                  
                  <a routerLink="/menu" 
                     class="w-full text-center text-neutral-600 py-2 px-4 rounded-lg hover:text-neutral-900 transition-colors block">
                    Continuar Comprando
                  </a>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
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
      error: (error) => {
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
        error: (error) => {
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
        error: (error) => {
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

  getOptionsText(options: { [key: string]: string }): string {
    if (!options || Object.keys(options).length === 0) {
      return '';
    }
    
    return Object.entries(options)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }
}