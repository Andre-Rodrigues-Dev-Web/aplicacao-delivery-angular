import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Product, ProductCategory, ProductFilter, ProductSort, ProductListResponse, CartService, AddToCartRequest } from '@delivery-vel/data';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-neutral-light">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 class="text-3xl font-bold text-neutral-900">Cardápio</h1>
          <p class="mt-2 text-neutral-600">Descubra os melhores pratos da região</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Sidebar Filters -->
          <div class="lg:w-1/4">
            <div class="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 class="text-lg font-semibold text-neutral-900 mb-4">Filtros</h3>
              
              <!-- Search -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-neutral-700 mb-2">Buscar</label>
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (ngModelChange)="onSearchChange()"
                  placeholder="Digite o nome do prato..."
                  class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>

              <!-- Categories -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-neutral-700 mb-2">Categorias</label>
                <div class="space-y-2">
                  @for (category of categories(); track category.id) {
                    <label class="flex items-center">
                      <input
                        type="checkbox"
                        [value]="category.id"
                        [checked]="selectedCategories().includes(category.id)"
                        (change)="onCategoryChange($event)"
                        class="h-4 w-4 text-brand-red focus:ring-brand-red border-neutral-300 rounded"
                      />
                      <span class="ml-2 text-sm text-neutral-900">{{ category.name }}</span>
                    </label>
                  }
                </div>
              </div>

              <!-- Price Range -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-neutral-700 mb-2">Faixa de Preço</label>
                <div class="flex items-center space-x-2">
                  <input
                    type="number"
                    [(ngModel)]="minPrice"
                    (ngModelChange)="onPriceChange()"
                    placeholder="Min"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red text-sm"
                  />
                  <span class="text-neutral-500">-</span>
                  <input
                    type="number"
                    [(ngModel)]="maxPrice"
                    (ngModelChange)="onPriceChange()"
                    placeholder="Max"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red text-sm"
                  />
                </div>
              </div>

              <!-- Rating Filter -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-neutral-700 mb-2">Avaliação Mínima</label>
                <div class="space-y-2">
                  @for (rating of [5, 4, 3, 2, 1]; track rating) {
                    <label class="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        [value]="rating"
                        [(ngModel)]="minRating"
                        (ngModelChange)="onRatingChange()"
                        class="h-4 w-4 text-brand-red focus:ring-brand-red border-neutral-300"
                      />
                      <span class="ml-2 flex items-center">
                        @for (star of [1,2,3,4,5]; track star) {
                          <span [class]="star <= rating ? 'text-yellow-400' : 'text-neutral-300'" class="text-sm">★</span>
                        }
                        <span class="ml-1 text-sm text-neutral-600">e acima</span>
                      </span>
                    </label>
                  }
                </div>
              </div>

              <!-- Clear Filters -->
              <button
                (click)="clearFilters()"
                class="w-full px-4 py-2 text-sm text-brand-red border border-brand-red rounded-md hover:bg-red-50 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          <!-- Main Content -->
          <div class="lg:w-3/4">
            <!-- Sort and Results Info -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div class="text-sm text-neutral-600">
                @if (isLoading()) {
                  <span>Carregando produtos...</span>
                } @else {
                  <span>{{ totalProducts() }} produtos encontrados</span>
                }
              </div>
              
              <div class="flex items-center gap-4">
                <label class="text-sm font-medium text-neutral-700">Ordenar por:</label>
                <select
                  [(ngModel)]="sortField"
                  (ngModelChange)="onSortChange()"
                  class="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red"
                >
                  <option value="popularity">Popularidade</option>
                  <option value="price">Menor Preço</option>
                  <option value="rating">Melhor Avaliação</option>
                  <option value="name">Nome A-Z</option>
                  <option value="preparationTime">Tempo de Preparo</option>
                </select>
              </div>
            </div>

            <!-- Loading State -->
            @if (isLoading()) {
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                @for (item of [1,2,3,4,5,6]; track item) {
                  <div class="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                    <div class="h-48 bg-neutral-200"></div>
                    <div class="p-4">
                      <div class="h-4 bg-neutral-200 rounded mb-2"></div>
                      <div class="h-3 bg-neutral-200 rounded mb-4"></div>
                      <div class="h-6 bg-neutral-200 rounded w-20"></div>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Products Grid -->
            @if (!isLoading() && products().length > 0) {
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                @for (product of products(); track product.id) {
                  <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                    <!-- Product Image -->
                    <div class="relative h-48 overflow-hidden">
                      <img
                        [src]="product.image"
                        [alt]="product.name"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      @if (product.discount && product.discount > 0) {
                        <div class="absolute top-2 left-2 bg-brand-red text-white px-2 py-1 rounded-md text-xs font-medium">
                          -{{ product.discount }}%
                        </div>
                      }
                      @if (product.isFeatured) {
                        <div class="absolute top-2 right-2 bg-brand-olive text-white px-2 py-1 rounded-md text-xs font-medium">
                          Destaque
                        </div>
                      }
                    </div>

                    <!-- Product Info -->
                    <div class="p-4">
                      <div class="flex items-start justify-between mb-2">
                        <h3 class="text-lg font-semibold text-neutral-900 group-hover:text-brand-red transition-colors">
                          {{ product.name }}
                        </h3>
                        @if (product.rating) {
                          <div class="flex items-center ml-2 flex-shrink-0">
                            <span class="text-yellow-400 text-sm">★</span>
                            <span class="text-sm text-neutral-600 ml-1">{{ product.rating }}</span>
                          </div>
                        }
                      </div>
                      
                      <p class="text-neutral-600 text-sm mb-3 line-clamp-2">{{ product.description }}</p>
                      
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center space-x-2">
                          @if (product.originalPrice && product.originalPrice > product.price) {
                            <span class="text-lg font-bold text-brand-red">
                              {{ product.price | currency:'BRL':'symbol':'1.2-2' }}
                            </span>
                            <span class="text-sm text-neutral-500 line-through">
                              {{ product.originalPrice | currency:'BRL':'symbol':'1.2-2' }}
                            </span>
                          } @else {
                            <span class="text-lg font-bold text-neutral-900">
                              {{ product.price | currency:'BRL':'symbol':'1.2-2' }}
                            </span>
                          }
                        </div>
                        @if (product.preparationTime) {
                          <span class="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                            {{ product.preparationTime }}min
                          </span>
                        }
                      </div>

                      <button 
                        (click)="addToCart(product)"
                        class="w-full bg-brand-red text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors font-medium">
                        Adicionar ao Carrinho
                      </button>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Empty State -->
            @if (!isLoading() && products().length === 0) {
              <div class="text-center py-12">
                <svg class="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.1-5.7-2.836"></path>
                </svg>
                <h3 class="text-lg font-medium text-neutral-900 mb-2">Nenhum produto encontrado</h3>
                <p class="text-neutral-600">Tente ajustar os filtros ou buscar por outros termos.</p>
              </div>
            }

            <!-- Pagination -->
            @if (!isLoading() && totalPages() > 1) {
              <div class="flex justify-center mt-8">
                <nav class="flex items-center space-x-2">
                  <button
                    (click)="goToPage(currentPage() - 1)"
                    [disabled]="currentPage() === 1"
                    class="px-3 py-2 text-sm font-medium text-neutral-500 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  
                  @for (page of getVisiblePages(); track page) {
                    <button
                      (click)="goToPage(page)"
                      [class]="page === currentPage() ? 'bg-brand-red text-white' : 'bg-white text-neutral-700 hover:bg-neutral-50'"
                      class="px-3 py-2 text-sm font-medium border border-neutral-300 rounded-md"
                    >
                      {{ page }}
                    </button>
                  }
                  
                  <button
                    (click)="goToPage(currentPage() + 1)"
                    [disabled]="currentPage() === totalPages()"
                    class="px-3 py-2 text-sm font-medium text-neutral-500 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </nav>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class MenuComponent implements OnInit {
  // Private signals
  private _products = signal<Product[]>([]);
  private _categories = signal<ProductCategory[]>([]);
  private _loading = signal(false);
  private _currentPage = signal(1);
  private _totalProducts = signal(0);
  private _selectedCategories = signal<string[]>([]);

  // Form controls
  searchTerm = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minRating: number | null = null;
  sortField = 'popularity';

  // Computed signals
  readonly products = this._products.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly isLoading = this._loading.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly totalProducts = this._totalProducts.asReadonly();
  readonly selectedCategories = this._selectedCategories.asReadonly();

  readonly totalPages = computed(() => Math.ceil(this.totalProducts() / 12));

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    
    // Verificar se há categoria selecionada na URL
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this._selectedCategories.set([params['category']]);
      }
    });
  }

  private loadCategories(): void {
    this.productService.getCategories().subscribe((categories: ProductCategory[]) => { 
      this._categories.set(categories);
    });
  }

  private loadProducts(): void {
    this._loading.set(true);

    const filter: ProductFilter = {
      searchTerm: this.searchTerm || undefined,
      categoryIds: this.selectedCategories().length > 0 ? this.selectedCategories() : undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      minRating: this.minRating || undefined,
      isAvailable: true
    };

    const sort: ProductSort = {
      field: this.sortField as any,
      direction: this.sortField === 'price' ? 'asc' : 'desc'
    };

    this.productService.getProducts(filter, sort, this.currentPage(), 12).subscribe((response: ProductListResponse) => {
      this._products.set(response.products);
      this._totalProducts.set(response.total);
      this._loading.set(false);
    });
  }

  onSearchChange(): void {
    this._currentPage.set(1);
    this.loadProducts();
  }

  onPriceChange(): void {
    this._currentPage.set(1);
    this.loadProducts();
  }

  onRatingChange(): void {
    this._currentPage.set(1);
    this.loadProducts();
  }

  onSortChange(): void {
    this._currentPage.set(1);
    this.loadProducts();
  }

  onCategoryChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const categoryId = target.value;
    const isChecked = target.checked;
    
    const currentCategories = this.selectedCategories();
    
    if (isChecked) {
      this._selectedCategories.set([...currentCategories, categoryId]);
    } else {
      this._selectedCategories.set(currentCategories.filter(id => id !== categoryId));
    }
    
    this._currentPage.set(1);
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.minRating = null;
    this._selectedCategories.set([]);
    this._currentPage.set(1);
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this._currentPage.set(page);
      this.loadProducts();
    }
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
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