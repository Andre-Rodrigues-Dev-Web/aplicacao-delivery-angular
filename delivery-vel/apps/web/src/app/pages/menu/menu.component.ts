import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, ProductCategory, ProductFilter, ProductSort } from '@delivery-vel/data';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 class="text-3xl font-bold text-gray-900">Cardápio</h1>
          <p class="mt-2 text-gray-600">Descubra os melhores pratos da região</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Sidebar Filters -->
          <div class="lg:w-1/4">
            <div class="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
              
              <!-- Search -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (ngModelChange)="onSearchChange()"
                  placeholder="Digite o nome do prato..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <!-- Categories -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3">Categorias</h4>
                <div class="space-y-2">
                  @for (category of categories(); track category.id) {
                    <label class="flex items-center">
                      <input
                        type="checkbox"
                        [checked]="selectedCategories().includes(category.id)"
                        (change)="toggleCategory(category.id)"
                        class="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span class="ml-2 text-sm text-gray-700">{{ category.emoji }} {{ category.name }}</span>
                    </label>
                  }
                </div>
              </div>

              <!-- Price Range -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3">Faixa de Preço</h4>
                <div class="space-y-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Mínimo</label>
                    <input
                      type="number"
                      [(ngModel)]="minPrice"
                      (ngModelChange)="onPriceChange()"
                      placeholder="R$ 0,00"
                      min="0"
                      step="0.50"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Máximo</label>
                    <input
                      type="number"
                      [(ngModel)]="maxPrice"
                      (ngModelChange)="onPriceChange()"
                      placeholder="R$ 100,00"
                      min="0"
                      step="0.50"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <!-- Rating -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3">Avaliação Mínima</h4>
                <select
                  [(ngModel)]="minRating"
                  (ngModelChange)="onRatingChange()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Qualquer avaliação</option>
                  <option value="4.5">4.5+ ⭐</option>
                  <option value="4.0">4.0+ ⭐</option>
                  <option value="3.5">3.5+ ⭐</option>
                  <option value="3.0">3.0+ ⭐</option>
                </select>
              </div>

              <!-- Clear Filters -->
              <button
                (click)="clearFilters()"
                class="w-full px-4 py-2 text-sm text-orange-600 border border-orange-600 rounded-md hover:bg-orange-50 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          <!-- Main Content -->
          <div class="lg:w-3/4">
            <!-- Sort and Results Info -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div class="text-sm text-gray-600">
                @if (loading()) {
                  <span>Carregando produtos...</span>
                } @else {
                  <span>{{ totalProducts() }} produtos encontrados</span>
                }
              </div>
              
              <div class="flex items-center gap-4">
                <label class="text-sm font-medium text-gray-700">Ordenar por:</label>
                <select
                  [(ngModel)]="sortField"
                  (ngModelChange)="onSortChange()"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            @if (loading()) {
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                @for (item of [1,2,3,4,5,6]; track item) {
                  <div class="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                    <div class="h-48 bg-gray-200"></div>
                    <div class="p-4">
                      <div class="h-4 bg-gray-200 rounded mb-2"></div>
                      <div class="h-3 bg-gray-200 rounded mb-4"></div>
                      <div class="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Products Grid -->
            @if (!loading() && products().length > 0) {
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
                      @if (product.discount) {
                        <div class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                          -{{ product.discount }}%
                        </div>
                      }
                      @if (product.isPopular) {
                        <div class="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                          Popular
                        </div>
                      }
                    </div>

                    <!-- Product Info -->
                    <div class="p-4">
                      <div class="flex items-start justify-between mb-2">
                        <h3 class="text-lg font-semibold text-gray-900 line-clamp-1">{{ product.name }}</h3>
                        <div class="flex items-center text-sm text-gray-600 ml-2">
                          <span class="text-yellow-400">⭐</span>
                          <span class="ml-1">{{ product.rating }}</span>
                        </div>
                      </div>

                      <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ product.description }}</p>

                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                          <span class="text-xs text-gray-500">{{ product.category.emoji }}</span>
                          <span class="text-xs text-gray-500">{{ product.category.name }}</span>
                        </div>
                        <div class="flex items-center text-xs text-gray-500">
                          <span>🕒</span>
                          <span class="ml-1">{{ product.preparationTime }}min</span>
                        </div>
                      </div>

                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          @if (product.originalPrice) {
                            <span class="text-sm text-gray-400 line-through">
                              R$ {{ product.originalPrice.toFixed(2).replace('.', ',') }}
                            </span>
                          }
                          <span class="text-lg font-bold text-gray-900">
                            R$ {{ product.price.toFixed(2).replace('.', ',') }}
                          </span>
                        </div>

                        <button
                          (click)="addToCart(product)"
                          [disabled]="!product.isAvailable"
                          class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          @if (product.isAvailable) {
                            Adicionar
                          } @else {
                            Indisponível
                          }
                        </button>
                      </div>

                      <!-- Tags -->
                      @if (product.tags.length > 0) {
                        <div class="flex flex-wrap gap-1 mt-3">
                          @for (tag of product.tags.slice(0, 3); track tag) {
                            <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {{ tag }}
                            </span>
                          }
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Pagination -->
              @if (totalPages() > 1) {
                <div class="flex justify-center items-center gap-2 mt-8">
                  <button
                    (click)="goToPage(currentPage() - 1)"
                    [disabled]="currentPage() === 1"
                    class="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  
                  @for (page of getPageNumbers(); track page) {
                    <button
                      (click)="goToPage(page)"
                      [class]="page === currentPage() ? 'px-3 py-2 bg-orange-600 text-white rounded-md' : 'px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50'"
                    >
                      {{ page }}
                    </button>
                  }
                  
                  <button
                    (click)="goToPage(currentPage() + 1)"
                    [disabled]="currentPage() === totalPages()"
                    class="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Próxima
                  </button>
                </div>
              }
            }

            <!-- Empty State -->
            @if (!loading() && products().length === 0) {
              <div class="text-center py-12">
                <div class="text-6xl mb-4">🍽️</div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
                <p class="text-gray-600 mb-4">Tente ajustar os filtros ou buscar por outros termos</p>
                <button
                  (click)="clearFilters()"
                  class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class MenuComponent implements OnInit {
  // Signals para estado reativo
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
  readonly loading = this._loading.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly totalProducts = this._totalProducts.asReadonly();
  readonly selectedCategories = this._selectedCategories.asReadonly();

  readonly totalPages = computed(() => Math.ceil(this.totalProducts() / 12));

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  private loadCategories(): void {
    this.productService.getCategories().subscribe(categories => {
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

    this.productService.getProducts(filter, sort, this.currentPage(), 12).subscribe(response => {
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

  toggleCategory(categoryId: string): void {
    const current = this.selectedCategories();
    if (current.includes(categoryId)) {
      this._selectedCategories.set(current.filter(id => id !== categoryId));
    } else {
      this._selectedCategories.set([...current, categoryId]);
    }
    this._currentPage.set(1);
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.minRating = null;
    this.sortField = 'popularity';
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

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(total);
      }
    }

    return pages;
  }

  addToCart(product: Product): void {
    // TODO: Implementar funcionalidade do carrinho
    console.log('Adicionando ao carrinho:', product.name);
    // Aqui você pode mostrar uma notificação ou abrir um modal
  }
}