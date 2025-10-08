import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { Product, ProductCategory, ProductFilter, ProductSort, ProductListResponse, Restaurant } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Signals para estado reativo
  private _products = signal<Product[]>([]);
  private _categories = signal<ProductCategory[]>([]);
  private _restaurants = signal<Restaurant[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Computed signals
  readonly products = this._products.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly restaurants = this._restaurants.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly featuredProducts = computed(() => 
    this._products().filter(p => p.isFeatured && p.isAvailable)
  );

  readonly popularProducts = computed(() => 
    this._products().filter(p => p.isPopular && p.isAvailable)
  );

  constructor() {
    this.initializeMockData();
  }

  // Buscar produtos com filtros e paginação
  getProducts(filter?: ProductFilter, sort?: ProductSort, page = 1, limit = 12): Observable<ProductListResponse> {
    this._loading.set(true);
    this._error.set(null);

    return of(null).pipe(
      delay(500), // Simular latência da API
      map(() => {
        let filteredProducts = [...this._products()];

        // Aplicar filtros
        if (filter) {
          if (filter.categoryIds?.length) {
            filteredProducts = filteredProducts.filter(p => 
              filter.categoryIds!.includes(p.category.id)
            );
          }

          if (filter.minPrice !== undefined) {
            filteredProducts = filteredProducts.filter(p => p.price >= filter.minPrice!);
          }

          if (filter.maxPrice !== undefined) {
            filteredProducts = filteredProducts.filter(p => p.price <= filter.maxPrice!);
          }

          if (filter.minRating !== undefined) {
            filteredProducts = filteredProducts.filter(p => p.rating >= filter.minRating!);
          }

          if (filter.isAvailable !== undefined) {
            filteredProducts = filteredProducts.filter(p => p.isAvailable === filter.isAvailable);
          }

          if (filter.isPopular !== undefined) {
            filteredProducts = filteredProducts.filter(p => p.isPopular === filter.isPopular);
          }

          if (filter.restaurantIds?.length) {
            filteredProducts = filteredProducts.filter(p => 
              filter.restaurantIds!.includes(p.restaurant.id)
            );
          }

          if (filter.tags?.length) {
            filteredProducts = filteredProducts.filter(p => 
              filter.tags!.some(tag => p.tags.includes(tag))
            );
          }

          if (filter.searchTerm) {
            const term = filter.searchTerm.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
              p.name.toLowerCase().includes(term) ||
              p.description.toLowerCase().includes(term) ||
              p.tags.some(tag => tag.toLowerCase().includes(term))
            );
          }
        }

        // Aplicar ordenação
        if (sort) {
          filteredProducts.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sort.field) {
              case 'name':
                aValue = a.name;
                bValue = b.name;
                break;
              case 'price':
                aValue = a.price;
                bValue = b.price;
                break;
              case 'rating':
                aValue = a.rating;
                bValue = b.rating;
                break;
              case 'preparationTime':
                aValue = a.preparationTime;
                bValue = b.preparationTime;
                break;
              case 'popularity':
                aValue = a.reviewCount;
                bValue = b.reviewCount;
                break;
              default:
                return 0;
            }

            if (sort.direction === 'asc') {
              return aValue > bValue ? 1 : -1;
            } else {
              return aValue < bValue ? 1 : -1;
            }
          });
        }

        // Aplicar paginação
        const total = filteredProducts.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        this._loading.set(false);

        return {
          products: paginatedProducts,
          total,
          page,
          limit,
          hasNext: endIndex < total,
          hasPrev: page > 1
        };
      })
    );
  }

  // Buscar produto por ID
  getProductById(id: string): Observable<Product | null> {
    return of(this._products().find(p => p.id === id) || null).pipe(delay(200));
  }

  // Buscar produtos por categoria
  getProductsByCategory(categoryId: string): Observable<Product[]> {
    return of(this._products().filter(p => p.category.id === categoryId && p.isAvailable)).pipe(delay(300));
  }

  // Buscar produtos por restaurante
  getProductsByRestaurant(restaurantId: string): Observable<Product[]> {
    return of(this._products().filter(p => p.restaurant.id === restaurantId && p.isAvailable)).pipe(delay(300));
  }

  // Buscar categorias
  getCategories(): Observable<ProductCategory[]> {
    return of(this._categories()).pipe(delay(200));
  }

  // Buscar restaurantes
  getRestaurants(): Observable<Restaurant[]> {
    return of(this._restaurants()).pipe(delay(200));
  }

  private initializeMockData(): void {
    // Mock Categories
    const categories: ProductCategory[] = [
      { id: '1', name: 'Pizza', slug: 'pizza', emoji: '🍕', isActive: true, sortOrder: 1 },
      { id: '2', name: 'Hambúrguer', slug: 'hamburguer', emoji: '🍔', isActive: true, sortOrder: 2 },
      { id: '3', name: 'Japonesa', slug: 'japonesa', emoji: '🍣', isActive: true, sortOrder: 3 },
      { id: '4', name: 'Italiana', slug: 'italiana', emoji: '🍝', isActive: true, sortOrder: 4 },
      { id: '5', name: 'Brasileira', slug: 'brasileira', emoji: '🍖', isActive: true, sortOrder: 5 },
      { id: '6', name: 'Doces', slug: 'doces', emoji: '🍰', isActive: true, sortOrder: 6 },
      { id: '7', name: 'Bebidas', slug: 'bebidas', emoji: '🥤', isActive: true, sortOrder: 7 },
      { id: '8', name: 'Saudável', slug: 'saudavel', emoji: '🥗', isActive: true, sortOrder: 8 }
    ];

    // Mock Restaurants
    const restaurants: Restaurant[] = [
      {
        id: '1',
        name: 'Pizzaria Bella Vista',
        slug: 'pizzaria-bella-vista',
        rating: 4.8,
        reviewCount: 324,
        deliveryTime: 25,
        deliveryFee: 4.90,
        minimumOrder: 20.00,
        isOpen: true,
        cuisine: ['Italiana', 'Pizza'],
        address: {
          street: 'Rua das Flores',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        }
      },
      {
        id: '2',
        name: 'Burger House',
        slug: 'burger-house',
        rating: 4.6,
        reviewCount: 189,
        deliveryTime: 20,
        deliveryFee: 3.50,
        minimumOrder: 15.00,
        isOpen: true,
        cuisine: ['Americana', 'Hambúrguer'],
        address: {
          street: 'Av. Paulista',
          number: '456',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100'
        }
      },
      {
        id: '3',
        name: 'Sushi Zen',
        slug: 'sushi-zen',
        rating: 4.9,
        reviewCount: 267,
        deliveryTime: 35,
        deliveryFee: 6.00,
        minimumOrder: 30.00,
        isOpen: true,
        cuisine: ['Japonesa', 'Sushi'],
        address: {
          street: 'Rua da Liberdade',
          number: '789',
          neighborhood: 'Liberdade',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01503-001'
        }
      }
    ];

    // Mock Products
    const products: Product[] = [
      {
        id: '1',
        name: 'Pizza Margherita',
        description: 'Pizza tradicional com molho de tomate, mussarela de búfala, manjericão fresco e azeite extra virgem',
        price: 32.90,
        originalPrice: 36.90,
        discount: 11,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop',
        category: categories[0],
        rating: 4.8,
        reviewCount: 124,
        preparationTime: 25,
        isAvailable: true,
        isPopular: true,
        isFeatured: true,
        tags: ['Vegetariano', 'Clássico', 'Italiana'],
        ingredients: ['Massa de pizza', 'Molho de tomate', 'Mussarela de búfala', 'Manjericão', 'Azeite'],
        restaurant: restaurants[0],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Pizza Pepperoni',
        description: 'Pizza com molho de tomate, mussarela e fatias generosas de pepperoni',
        price: 38.90,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop',
        category: categories[0],
        rating: 4.7,
        reviewCount: 98,
        preparationTime: 25,
        isAvailable: true,
        isPopular: true,
        tags: ['Clássico', 'Italiana'],
        ingredients: ['Massa de pizza', 'Molho de tomate', 'Mussarela', 'Pepperoni'],
        restaurant: restaurants[0],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '3',
        name: 'Hambúrguer Artesanal',
        description: 'Hambúrguer 180g de carne bovina, queijo cheddar, alface, tomate, cebola roxa e molho especial da casa',
        price: 28.50,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
        category: categories[1],
        rating: 4.6,
        reviewCount: 89,
        preparationTime: 20,
        isAvailable: true,
        isPopular: true,
        isFeatured: true,
        tags: ['Artesanal', 'Carne'],
        ingredients: ['Pão brioche', 'Hambúrguer 180g', 'Queijo cheddar', 'Alface', 'Tomate', 'Cebola roxa'],
        restaurant: restaurants[1],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '4',
        name: 'Sushi Combo Premium',
        description: '20 peças variadas: sashimi de salmão e atum, nigiri, uramaki filadélfia e temaki especiais',
        price: 45.90,
        originalPrice: 52.90,
        discount: 13,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
        category: categories[2],
        rating: 4.9,
        reviewCount: 156,
        preparationTime: 35,
        isAvailable: true,
        isPopular: true,
        isFeatured: true,
        tags: ['Premium', 'Fresco', 'Japonês'],
        ingredients: ['Salmão fresco', 'Atum', 'Arroz japonês', 'Nori', 'Cream cheese', 'Pepino'],
        restaurant: restaurants[2],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '5',
        name: 'Lasanha Bolonhesa',
        description: 'Lasanha tradicional com molho bolonhesa, queijos mussarela e parmesão, manjericão fresco',
        price: 24.90,
        image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop',
        category: categories[3],
        rating: 4.5,
        reviewCount: 67,
        preparationTime: 30,
        isAvailable: true,
        tags: ['Tradicional', 'Italiana', 'Caseiro'],
        ingredients: ['Massa de lasanha', 'Carne moída', 'Molho de tomate', 'Mussarela', 'Parmesão'],
        restaurant: restaurants[0],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '6',
        name: 'Açaí Completo 500ml',
        description: 'Açaí cremoso 500ml com granola crocante, banana, morango, leite condensado e mel',
        price: 18.90,
        image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop',
        category: categories[5],
        rating: 4.7,
        reviewCount: 203,
        preparationTime: 10,
        isAvailable: true,
        isPopular: true,
        tags: ['Doce', 'Saudável', 'Brasileiro'],
        ingredients: ['Açaí', 'Granola', 'Banana', 'Morango', 'Leite condensado', 'Mel'],
        restaurant: restaurants[0],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '7',
        name: 'Salada Caesar Premium',
        description: 'Mix de folhas verdes, frango grelhado, croutons artesanais, parmesão e molho caesar',
        price: 22.90,
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
        category: categories[7],
        rating: 4.4,
        reviewCount: 45,
        preparationTime: 15,
        isAvailable: true,
        tags: ['Saudável', 'Proteína', 'Light'],
        ingredients: ['Mix de folhas', 'Frango grelhado', 'Croutons', 'Parmesão', 'Molho caesar'],
        restaurant: restaurants[1],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '8',
        name: 'Refrigerante 2L',
        description: 'Refrigerante gelado 2 litros - Coca-Cola, Guaraná ou Fanta',
        price: 8.90,
        image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop',
        category: categories[6],
        rating: 4.2,
        reviewCount: 78,
        preparationTime: 5,
        isAvailable: true,
        tags: ['Bebida', 'Gelado'],
        restaurant: restaurants[0],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      }
    ];

    // Adicionar mais produtos para demonstrar variedade
    const additionalProducts: Product[] = [
      {
        id: '9',
        name: 'Pizza Quatro Queijos',
        description: 'Pizza com mussarela, gorgonzola, parmesão e provolone',
        price: 42.90,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
        category: categories[0],
        rating: 4.6,
        reviewCount: 87,
        preparationTime: 25,
        isAvailable: true,
        tags: ['Queijos', 'Italiana'],
        ingredients: ['Massa de pizza', 'Mussarela', 'Gorgonzola', 'Parmesão', 'Provolone'],
        restaurant: restaurants[0],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '10',
        name: 'X-Bacon Duplo',
        description: 'Dois hambúrgueres, bacon crocante, queijo cheddar e molho barbecue',
        price: 34.90,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop',
        category: categories[1],
        rating: 4.8,
        reviewCount: 112,
        preparationTime: 22,
        isAvailable: true,
        isPopular: true,
        tags: ['Bacon', 'Duplo', 'Barbecue'],
        ingredients: ['Pão', '2x Hambúrguer', 'Bacon', 'Cheddar', 'Molho barbecue'],
        restaurant: restaurants[1],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '11',
        name: 'Temaki Salmão',
        description: 'Temaki de salmão fresco com cream cheese e pepino',
        price: 12.90,
        image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=300&fit=crop',
        category: categories[2],
        rating: 4.7,
        reviewCount: 93,
        preparationTime: 15,
        isAvailable: true,
        tags: ['Salmão', 'Fresco'],
        ingredients: ['Nori', 'Salmão', 'Cream cheese', 'Pepino', 'Arroz'],
        restaurant: restaurants[2],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '12',
        name: 'Brownie com Sorvete',
        description: 'Brownie de chocolate quente com sorvete de baunilha e calda',
        price: 16.90,
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
        category: categories[5],
        rating: 4.9,
        reviewCount: 145,
        preparationTime: 12,
        isAvailable: true,
        isFeatured: true,
        tags: ['Chocolate', 'Quente', 'Sobremesa'],
        ingredients: ['Brownie', 'Sorvete de baunilha', 'Calda de chocolate'],
        restaurant: restaurants[1],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      }
    ];

    this._categories.set(categories);
    this._restaurants.set(restaurants);
    this._products.set([...products, ...additionalProducts]);
  }
}