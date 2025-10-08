import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest, CartSummary } from '../models/cart.model';
import { Product } from '../models/product.model';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private _cart = signal<Cart>({
    id: 'cart-1',
    items: [],
    subtotal: 0,
    deliveryFee: 5.90,
    total: 0,
    itemCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Computed signals para valores derivados
  readonly cart = this._cart.asReadonly();
  readonly items = computed(() => this._cart().items);
  readonly itemCount = computed(() => this._cart().items.reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotal = computed(() => this._cart().items.reduce((sum, item) => sum + item.subtotal, 0));
  readonly deliveryFee = computed(() => this.subtotal() > 0 ? this._cart().deliveryFee : 0);
  readonly total = computed(() => this.subtotal() + this.deliveryFee());
  readonly isEmpty = computed(() => this._cart().items.length === 0);

  constructor(private productService: ProductService) {}

  // Adicionar produto ao carrinho
  addToCart(request: AddToCartRequest): Observable<CartItem> {
    return new Observable(observer => {
      this.productService.getProductById(request.productId).subscribe(product => {
        if (!product) {
          observer.error('Produto não encontrado');
          return;
        }

        const currentCart = this._cart();
        const existingItemIndex = currentCart.items.findIndex(
          item => item.product.id === request.productId
        );

        let updatedItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Atualizar quantidade do item existente
          updatedItems = [...currentCart.items];
          const existingItem = updatedItems[existingItemIndex];
          existingItem.quantity += request.quantity;
          existingItem.subtotal = existingItem.quantity * existingItem.product.price;
        } else {
          // Adicionar novo item
          const newItem: CartItem = {
            id: `item-${Date.now()}`,
            product,
            quantity: request.quantity,
            notes: request.notes,
            options: request.options,
            subtotal: request.quantity * product.price,
            addedAt: new Date()
          };
          updatedItems = [...currentCart.items, newItem];
        }

        this.updateCart(updatedItems);
        
        const addedItem = updatedItems.find(item => item.product.id === request.productId)!;
        observer.next(addedItem);
        observer.complete();
      });
    });
  }

  // Atualizar item do carrinho
  updateCartItem(itemId: string, request: UpdateCartItemRequest): Observable<CartItem> {
    return new Observable(observer => {
      const currentCart = this._cart();
      const itemIndex = currentCart.items.findIndex(item => item.id === itemId);

      if (itemIndex === -1) {
        observer.error('Item não encontrado no carrinho');
        return;
      }

      const updatedItems = [...currentCart.items];
      const item = updatedItems[itemIndex];
      
      item.quantity = request.quantity;
      item.notes = request.notes;
      item.options = request.options;
      item.subtotal = item.quantity * item.product.price;

      this.updateCart(updatedItems);
      observer.next(item);
      observer.complete();
    });
  }

  // Remover item do carrinho
  removeFromCart(itemId: string): Observable<boolean> {
    return new Observable(observer => {
      const currentCart = this._cart();
      const updatedItems = currentCart.items.filter(item => item.id !== itemId);
      
      this.updateCart(updatedItems);
      observer.next(true);
      observer.complete();
    });
  }

  // Limpar carrinho
  clearCart(): Observable<boolean> {
    return new Observable(observer => {
      this.updateCart([]);
      observer.next(true);
      observer.complete();
    });
  }

  // Obter resumo do carrinho
  getCartSummary(): Observable<CartSummary> {
    return of({
      itemCount: this.itemCount(),
      subtotal: this.subtotal(),
      deliveryFee: this.deliveryFee(),
      total: this.total()
    });
  }

  // Método privado para atualizar o carrinho
  private updateCart(items: CartItem[]): void {
    const currentCart = this._cart();
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const deliveryFee = subtotal > 0 ? currentCart.deliveryFee : 0;

    this._cart.set({
      ...currentCart,
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      itemCount,
      updatedAt: new Date()
    });
  }
}