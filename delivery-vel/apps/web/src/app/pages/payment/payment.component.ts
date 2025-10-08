import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '@delivery-vel/data';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-neutral-light py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-900 mb-2">Finalizar Pedido</h1>
          <p class="text-neutral-600">Confirme seus dados e finalize sua compra</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Payment Form -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold text-neutral-900 mb-6">Dados de Entrega</h2>
              
              <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()">
                <!-- Personal Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label class="block text-sm font-medium text-neutral-700 mb-2">Nome Completo</label>
                    <input 
                      type="text" 
                      formControlName="fullName"
                      class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      placeholder="Seu nome completo"
                    >
                    @if (paymentForm.get('fullName')?.invalid && paymentForm.get('fullName')?.touched) {
                      <p class="text-red-500 text-sm mt-1">Nome é obrigatório</p>
                    }
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-neutral-700 mb-2">Telefone</label>
                    <input 
                      type="tel" 
                      formControlName="phone"
                      (input)="formatPhoneNumber($event)"
                      class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      placeholder="(11) 99999-9999"
                      maxlength="15"
                    >
                    @if (paymentForm.get('phone')?.invalid && paymentForm.get('phone')?.touched) {
                      <p class="text-red-500 text-sm mt-1">Telefone é obrigatório</p>
                    }
                  </div>
                </div>

                <!-- Address -->
                <div class="mb-6">
                  <h3 class="text-lg font-medium text-neutral-900 mb-4">Endereço de Entrega</h3>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-neutral-700 mb-2">Rua</label>
                      <input 
                        type="text" 
                        formControlName="street"
                        class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                        placeholder="Nome da rua"
                      >
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-neutral-700 mb-2">Número</label>
                      <input 
                        type="text" 
                        formControlName="number"
                        class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                        placeholder="123"
                      >
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label class="block text-sm font-medium text-neutral-700 mb-2">Bairro</label>
                      <input 
                        type="text" 
                        formControlName="neighborhood"
                        class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                        placeholder="Nome do bairro"
                      >
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-neutral-700 mb-2">CEP</label>
                      <input 
                        type="text" 
                        formControlName="zipCode"
                        class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                        placeholder="00000-000"
                      >
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-neutral-700 mb-2">Complemento (opcional)</label>
                    <input 
                      type="text" 
                      formControlName="complement"
                      class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      placeholder="Apartamento, bloco, etc."
                    >
                  </div>
                </div>

                <!-- Payment Method -->
                <div class="mb-6">
                  <h3 class="text-lg font-medium text-neutral-900 mb-4">Forma de Pagamento</h3>
                  
                  <div class="space-y-3">
                    <label class="flex items-center p-4 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="credit"
                        formControlName="paymentMethod"
                        class="text-brand-red focus:ring-brand-red"
                      >
                      <span class="ml-3 text-neutral-900">💳 Cartão de Crédito</span>
                    </label>
                    
                    <label class="flex items-center p-4 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="debit"
                        formControlName="paymentMethod"
                        class="text-brand-red focus:ring-brand-red"
                      >
                      <span class="ml-3 text-neutral-900">💳 Cartão de Débito</span>
                    </label>
                    
                    <label class="flex items-center p-4 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="pix"
                        formControlName="paymentMethod"
                        class="text-brand-red focus:ring-brand-red"
                      >
                      <span class="ml-3 text-neutral-900">📱 PIX</span>
                    </label>
                    
                    <label class="flex items-center p-4 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cash"
                        formControlName="paymentMethod"
                        class="text-brand-red focus:ring-brand-red"
                      >
                      <span class="ml-3 text-neutral-900">💵 Dinheiro</span>
                    </label>
                  </div>
                </div>

                <!-- Observations -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-neutral-700 mb-2">Observações (opcional)</label>
                  <textarea 
                    formControlName="observations"
                    rows="3"
                    class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                    placeholder="Alguma observação especial para o pedido..."
                  ></textarea>
                </div>
              </form>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 class="text-xl font-semibold text-neutral-900 mb-6">Resumo do Pedido</h2>
              
              <!-- Items -->
              <div class="space-y-4 mb-6">
                @for (item of cartItems(); track item.id) {
                  <div class="flex items-center gap-3">
                    <img 
                      [src]="item.product.image" 
                      [alt]="item.product.name"
                      class="w-12 h-12 object-cover rounded-lg"
                    >
                    <div class="flex-1">
                      <h4 class="font-medium text-neutral-900 text-sm">{{ item.product.name }}</h4>
                      <p class="text-neutral-600 text-xs">Qtd: {{ item.quantity }}</p>
                    </div>
                    <span class="font-semibold text-neutral-900 text-sm">
                      R$ {{ (item.product.price * item.quantity).toFixed(2) }}
                    </span>
                  </div>
                }
              </div>

              <!-- Totals -->
              <div class="border-t border-neutral-200 pt-4 space-y-2">
                <div class="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>R$ {{ subtotal().toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-neutral-600">
                  <span>Taxa de entrega</span>
                  <span>R$ {{ deliveryFee().toFixed(2) }}</span>
                </div>
                <div class="border-t border-neutral-300 pt-2">
                  <div class="flex justify-between text-lg font-bold text-neutral-900">
                    <span>Total</span>
                    <span>R$ {{ total().toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="mt-6 space-y-3">
                <button 
                  type="submit"
                  (click)="onSubmit()"
                  [disabled]="paymentForm.invalid || isProcessing()"
                  class="w-full bg-brand-red text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  @if (isProcessing()) {
                    Processando...
                  } @else {
                    Finalizar Pedido
                  }
                </button>
                
                <button 
                  type="button"
                  (click)="goBack()"
                  class="w-full bg-neutral-300 text-neutral-700 py-3 rounded-lg font-semibold hover:bg-neutral-400 transition-colors"
                >
                  Voltar ao Carrinho
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PaymentComponent implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  paymentForm: FormGroup;
  private _isProcessing = signal(false);

  readonly isProcessing = this._isProcessing.asReadonly();
  readonly cart = this.cartService.cart;
  readonly cartItems = computed(() => this.cart().items);
  readonly subtotal = computed(() => this.cartService.subtotal());
  readonly deliveryFee = computed(() => this.cartService.deliveryFee());
  readonly total = computed(() => this.cartService.total());

  constructor() {
    this.paymentForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      street: ['', [Validators.required]],
      number: ['', [Validators.required]],
      neighborhood: ['', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      complement: [''],
      paymentMethod: ['', [Validators.required]],
      observations: ['']
    });
  }

  ngOnInit(): void {
    // Redirect if cart is empty
    if (this.cartItems().length === 0) {
      this.router.navigate(['/menu']);
    }
  }

  onSubmit(): void {
    if (this.paymentForm.valid && !this.isProcessing()) {
      this._isProcessing.set(true);

      // Simulate payment processing
      setTimeout(() => {
        // Clear cart after successful payment
        this.cartService.clearCart();
        this._isProcessing.set(false);
        
        // Activate chat for customer support after successful order
        sessionStorage.setItem('openChat', 'true');
        sessionStorage.setItem('orderCompleted', 'true');
        
        // Show success message and redirect
        alert('Pedido realizado com sucesso! Você receberá uma confirmação em breve. Um chat foi aberto para acompanhar seu pedido.');
        this.router.navigate(['/orders']);
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.paymentForm.controls).forEach(key => {
        this.paymentForm.get(key)?.markAsTouched();
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }

  formatPhoneNumber(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    
    // Limita a 11 dígitos (DDD + número)
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    
    let formattedValue = '';
    
    // Aplica a máscara baseada no tamanho
    if (value.length === 0) {
      formattedValue = '';
    } else if (value.length <= 2) {
      formattedValue = `(${value}`;
    } else if (value.length <= 6) {
      formattedValue = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    } else if (value.length <= 10) {
      // Para números com 8 dígitos (fixo): (XX) XXXX-XXXX
      formattedValue = `(${value.substring(0, 2)}) ${value.substring(2, 6)}-${value.substring(6)}`;
    } else {
      // Para números com 9 dígitos (celular): (XX) XXXXX-XXXX
      formattedValue = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
    }
    
    // Atualiza o valor do input
    input.value = formattedValue;
    
    // Atualiza o form control com o valor formatado
    this.paymentForm.get('phone')?.setValue(formattedValue);
    
    // Marca o campo como touched para ativar a validação
    this.paymentForm.get('phone')?.markAsTouched();
  }
}