import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem } from '@delivery-vel/data';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" (click)="closeCart()">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 class="text-2xl font-bold text-neutral-900">Meu Carrinho</h2>
          <button 
            (click)="closeCart()"
            class="text-neutral-500 hover:text-neutral-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <!-- Cart Content -->
        <div class="flex-1 overflow-y-auto">
          @if (cartService.isEmpty()) {
            <!-- Empty Cart -->
            <div class="p-8 text-center">
              <div class="text-6xl mb-4">🛒</div>
              <h3 class="text-xl font-semibold text-neutral-900 mb-2">Seu carrinho está vazio</h3>
              <p class="text-neutral-600 mb-6">Adicione alguns produtos deliciosos para começar!</p>
              <button 
                (click)="goToMenu()"
                class="bg-brand-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Ver Cardápio
              </button>
            </div>
          } @else {
            <!-- Cart Items -->
            <div class="p-6">
              <div class="space-y-4">
                @for (item of cartService.items(); track item.id) {
                  <div class="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
                    <!-- Product Image -->
                    <img 
                      [src]="item.product.image" 
                      [alt]="item.product.name"
                      class="w-16 h-16 object-cover rounded-lg"
                    >
                    
                    <!-- Product Info -->
                    <div class="flex-1">
                      <h4 class="font-semibold text-neutral-900">{{ item.product.name }}</h4>
                      <p class="text-sm text-neutral-600">{{ item.product.description }}</p>
                      <div class="flex items-center gap-2 mt-2">
                        <span class="text-sm text-neutral-500">Qtd:</span>
                        <div class="flex items-center gap-2">
                          <button 
                            (click)="decreaseQuantity(item)"
                            class="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center hover:bg-neutral-300 transition-colors"
                          >
                            -
                          </button>
                          <span class="font-semibold">{{ item.quantity }}</span>
                          <button 
                            (click)="increaseQuantity(item)"
                            class="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center hover:bg-neutral-300 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Price and Remove -->
                    <div class="text-right">
                      <div class="font-bold text-lg text-neutral-900">
                        R$ {{ item.subtotal.toFixed(2).replace('.', ',') }}
                      </div>
                      <button 
                        (click)="removeItem(item)"
                        class="text-red-500 hover:text-red-700 text-sm mt-1 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Cart Summary -->
              <div class="mt-6 p-4 bg-neutral-100 rounded-lg">
                <div class="space-y-2">
                  <div class="flex justify-between text-neutral-600">
                    <span>Subtotal ({{ cartService.itemCount() }} itens)</span>
                    <span>R$ {{ cartService.subtotal().toFixed(2).replace('.', ',') }}</span>
                  </div>
                  <div class="flex justify-between text-neutral-600">
                    <span>Taxa de entrega</span>
                    <span>R$ {{ cartService.deliveryFee().toFixed(2).replace('.', ',') }}</span>
                  </div>
                  <div class="border-t border-neutral-300 pt-2">
                    <div class="flex justify-between text-lg font-bold text-neutral-900">
                      <span>Total</span>
                      <span>R$ {{ cartService.total().toFixed(2).replace('.', ',') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Footer Actions -->
        @if (!cartService.isEmpty()) {
          <div class="p-6 border-t border-neutral-200 bg-neutral-50">
            <div class="flex gap-4">
              <button 
                (click)="clearCart()"
                class="flex-1 bg-neutral-300 text-neutral-700 py-3 rounded-lg font-semibold hover:bg-neutral-400 transition-colors"
              >
                Cancelar Compra
              </button>
              <button 
                (click)="proceedToPayment()"
                class="flex-1 bg-brand-red text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Confirmar Compra
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class CartComponent implements OnInit {
  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  closeCart(): void {
    // Emit event to parent component to close cart
    window.dispatchEvent(new CustomEvent('closeCart'));
  }

  goToMenu(): void {
    this.closeCart();
    this.router.navigate(['/menu']);
  }

  increaseQuantity(item: CartItem): void {
    this.cartService.updateCartItem(item.id, {
      quantity: item.quantity + 1,
      notes: item.notes,
      options: item.options
    }).subscribe({
      next: () => {
        // Item updated successfully
      },
      error: (error) => {
        console.error('Erro ao atualizar quantidade:', error);
      }
    });
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateCartItem(item.id, {
        quantity: item.quantity - 1,
        notes: item.notes,
        options: item.options
      }).subscribe({
        next: () => {
          // Item updated successfully
        },
        error: (error) => {
          console.error('Erro ao atualizar quantidade:', error);
        }
      });
    } else {
      this.removeItem(item);
    }
  }

  removeItem(item: CartItem): void {
    if (confirm(`Deseja remover ${item.product.name} do carrinho?`)) {
      this.cartService.removeFromCart(item.id).subscribe({
        next: () => {
          // Item removed successfully
        },
        error: (error) => {
          console.error('Erro ao remover item:', error);
        }
      });
    }
  }

  clearCart(): void {
    if (confirm('Deseja cancelar toda a compra e limpar o carrinho?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.closeCart();
        },
        error: (error) => {
          console.error('Erro ao limpar carrinho:', error);
        }
      });
    }
  }

  proceedToPayment(): void {
    this.closeCart();
    this.router.navigate(['/payment']);
  }
}