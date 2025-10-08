import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { ProductService, Product, ProductCategory, ProductListResponse, CartService, AddToCartRequest } from '@delivery-vel/data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-light">
      <!-- Hero Section -->
      <section class="bg-gradient-to-r from-brand-lime to-brand-olive text-neutral-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div class="text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-6">
              Delivery Rápido e Saboroso
            </h1>
            <p class="text-xl md:text-2xl mb-8 text-neutral-700">
              Os melhores restaurantes da cidade na palma da sua mão
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                routerLink="/menu" 
                class="bg-brand-red text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-600 transition-colors inline-block shadow-lg"
              >
                Ver Cardápio
              </a>
              <button class="border-2 border-neutral-900 text-neutral-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-neutral-900 hover:text-brand-lime transition-colors">
                Baixar App
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-neutral-900 mb-4">Por que escolher o Delivery Vel?</h2>
            <p class="text-neutral-600 text-lg">Experiência completa de delivery com qualidade e rapidez</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center p-6 bg-neutral-light rounded-lg hover:shadow-lg transition-shadow">
              <div class="w-16 h-16 bg-brand-lime rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">🚀</span>
              </div>
              <h3 class="text-xl font-semibold text-neutral-900 mb-2">Entrega Rápida</h3>
              <p class="text-neutral-600">Entregamos em até 30 minutos na sua região</p>
            </div>
            
            <div class="text-center p-6 bg-neutral-light rounded-lg hover:shadow-lg transition-shadow">
              <div class="w-16 h-16 bg-brand-olive rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">🍽️</span>
              </div>
              <h3 class="text-xl font-semibold text-neutral-900 mb-2">Qualidade Garantida</h3>
              <p class="text-neutral-600">Parceiros selecionados com os melhores pratos</p>
            </div>
            
            <div class="text-center p-6 bg-neutral-light rounded-lg hover:shadow-lg transition-shadow">
              <div class="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">💳</span>
              </div>
              <h3 class="text-xl font-semibold text-neutral-900 mb-2">Pagamento Fácil</h3>
              <p class="text-neutral-600">Pague com cartão, PIX ou dinheiro</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="py-16 bg-neutral-light">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-neutral-900 mb-4">Categorias Populares</h2>
            <p class="text-neutral-600 text-lg">Explore nossos sabores favoritos</p>
          </div>
          
          @if (categoriesLoading()) {
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              @for (item of [1,2,3,4,5,6,7,8]; track item) {
                <div class="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow animate-pulse">
                  <div class="w-12 h-12 bg-neutral-200 rounded-full mx-auto mb-3"></div>
                  <div class="h-4 bg-neutral-200 rounded"></div>
                </div>
              }
            </div>
          } @else {
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              @for (category of categories(); track category.id) {
                <a 
                  routerLink="/menu"
                  [queryParams]="{ category: category.id }"
                  class="bg-white rounded-lg p-6 text-center hover:shadow-md hover:bg-brand-lime transition-all cursor-pointer group"
                >
                  <div class="text-3xl mb-3 group-hover:scale-110 transition-transform">{{ category.emoji }}</div>
                  <h3 class="text-sm font-medium text-neutral-900 group-hover:text-neutral-800">{{ category.name }}</h3>
                </a>
              }
            </div>
          }
        </div>
      </section>

      <!-- Featured Products Section -->
      <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center mb-12">
            <div>
              <h2 class="text-3xl font-bold text-neutral-900 mb-4">Pratos em Destaque</h2>
              <p class="text-neutral-600 text-lg">Os favoritos dos nossos clientes</p>
            </div>
            <a 
              routerLink="/menu" 
              class="text-brand-red hover:text-red-600 font-semibold flex items-center transition-colors"
            >
              Ver todos
              <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>
          
          @if (productsLoading()) {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              @for (item of [1,2,3,4]; track item) {
                <div class="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                  <div class="h-48 bg-neutral-200"></div>
                  <div class="p-4">
                    <div class="h-4 bg-neutral-200 rounded mb-2"></div>
                    <div class="h-3 bg-neutral-200 rounded mb-4"></div>
                    <div class="h-6 bg-neutral-200 rounded"></div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              @for (product of featuredProducts(); track product.id) {
                <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow group">
                  <div class="relative h-48 overflow-hidden">
                    <img 
                      [src]="product.image" 
                      [alt]="product.name"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    @if (product.discount) {
                      <div class="absolute top-2 left-2 bg-brand-red text-white px-2 py-1 rounded-md text-xs font-semibold">
                        -{{ product.discount }}%
                      </div>
                    }
                    @if (product.isPopular) {
                      <div class="absolute top-2 right-2 bg-brand-olive text-neutral-900 px-2 py-1 rounded-md text-xs font-semibold">
                        Popular
                      </div>
                    }
                  </div>
                  
                  <div class="p-4">
                    <div class="flex items-start justify-between mb-2">
                      <h3 class="text-lg font-semibold text-neutral-900 line-clamp-1">{{ product.name }}</h3>
                      <div class="flex items-center text-sm text-neutral-600 ml-2">
                        <span class="text-yellow-400">⭐</span>
                        <span class="ml-1">{{ product.rating }}</span>
                      </div>
                    </div>
                    
                    <p class="text-sm text-neutral-600 mb-3 line-clamp-2">{{ product.description }}</p>
                    
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-neutral-500">{{ product.category.emoji }}</span>
                        <span class="text-xs text-neutral-500">{{ product.category.name }}</span>
                      </div>
                      <div class="flex items-center text-xs text-neutral-500">
                        <span>🕒</span>
                        <span class="ml-1">{{ product.preparationTime }}min</span>
                      </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        @if (product.originalPrice) {
                          <span class="text-sm text-neutral-400 line-through">
                            R$ {{ product.originalPrice.toFixed(2).replace('.', ',') }}
                          </span>
                        }
                        <span class="text-lg font-bold text-neutral-900">
                          R$ {{ product.price.toFixed(2).replace('.', ',') }}
                        </span>
                      </div>
                      
                      <button
                        (click)="addToCart(product)"
                        [disabled]="!product.isAvailable"
                        class="px-4 py-2 bg-brand-red text-white rounded-md hover:bg-red-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        @if (product.isAvailable) {
                          Adicionar
                        } @else {
                          Indisponível
                        }
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-16 bg-gradient-to-r from-brand-olive to-brand-lime">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl font-bold text-neutral-900 mb-4">
            Pronto para fazer seu pedido?
          </h2>
          <p class="text-xl text-neutral-700 mb-8">
            Milhares de opções deliciosas esperando por você
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              routerLink="/menu" 
              class="bg-brand-red text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-600 transition-colors inline-block shadow-lg"
            >
              Explorar Cardápio
            </a>
            <a 
              routerLink="/auth/register" 
              class="border-2 border-neutral-900 text-neutral-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-neutral-900 hover:text-brand-lime transition-colors"
            >
              Criar Conta
            </a>
          </div>
        </div>
      </section>
    </div>
  `
})
export class HomeComponent implements OnInit {
  // Signals para estado reativo
  private _categories = signal<ProductCategory[]>([]);
  private _featuredProducts = signal<Product[]>([]);
  private _categoriesLoading = signal(false);
  private _productsLoading = signal(false);

  // Computed signals para acesso readonly
  readonly categories = this._categories.asReadonly();
  readonly featuredProducts = this._featuredProducts.asReadonly();
  readonly categoriesLoading = this._categoriesLoading.asReadonly();
  readonly productsLoading = this._productsLoading.asReadonly();

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeaturedProducts();
  }

  private loadCategories(): void {
    this._categoriesLoading.set(true);
    this.productService.getCategories().subscribe((categories: ProductCategory[]) => {
      this._categories.set(categories);
      this._categoriesLoading.set(false);
    });
  }

  private loadFeaturedProducts(): void {
    this._productsLoading.set(true);
    // Buscar produtos em destaque
    this.productService.getProducts({ isAvailable: true }, { field: 'rating', direction: 'desc' }, 1, 4)
      .subscribe((response: ProductListResponse) => {
        this._featuredProducts.set(response.products);
        this._productsLoading.set(false);
      });
  }

  addToCart(product: Product): void {
    const request: AddToCartRequest = {
      productId: product.id,
      quantity: 1
    };

    this.cartService.addToCart(request).subscribe({
      next: (cartItem) => {
        alert(`${product.name} foi adicionado ao carrinho!`);
      },
      error: (error) => {
        console.error('Erro ao adicionar produto ao carrinho:', error);
        alert('Erro ao adicionar produto ao carrinho. Tente novamente.');
      }
    });
  }
}