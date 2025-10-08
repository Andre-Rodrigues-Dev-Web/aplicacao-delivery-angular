import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-gradient-to-br from-orange-50 to-red-50">
      <!-- Hero Section -->
      <section class="relative py-20 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Comida deliciosa
            <span class="text-orange-600">entregue rapidamente</span>
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Descubra os melhores restaurantes da sua região e receba sua comida favorita 
            no conforto da sua casa em minutos.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              routerLink="/menu"
              class="bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
              Ver Cardápio
            </button>
            <button class="border-2 border-orange-600 text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
              Como Funciona
            </button>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
            Por que escolher o DeliveryVel?
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Entrega Rápida</h3>
              <p class="text-gray-600">Receba seu pedido em até 30 minutos</p>
            </div>
            <div class="text-center">
              <div class="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Qualidade Garantida</h3>
              <p class="text-gray-600">Restaurantes selecionados e avaliados</p>
            </div>
            <div class="text-center">
              <div class="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Melhor Preço</h3>
              <p class="text-gray-600">Ofertas exclusivas e promoções diárias</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
            Categorias Populares
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            @for (category of categories; track category.id) {
              <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6 text-center">
                <div class="text-4xl mb-3">{{ category.emoji }}</div>
                <h3 class="font-semibold text-gray-900">{{ category.name }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ category.count }} opções</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-16 bg-orange-600">
        <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-white mb-4">
            Pronto para fazer seu pedido?
          </h2>
          <p class="text-xl text-orange-100 mb-8">
            Cadastre-se agora e ganhe 20% de desconto no primeiro pedido!
          </p>
          <button 
            routerLink="/auth/register"
            class="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Criar Conta Grátis
          </button>
        </div>
      </section>
    </div>
  `
})
export class HomeComponent {
  categories = [
    { id: 1, name: 'Pizza', emoji: '🍕', count: 25 },
    { id: 2, name: 'Hambúrguer', emoji: '🍔', count: 18 },
    { id: 3, name: 'Japonesa', emoji: '🍣', count: 12 },
    { id: 4, name: 'Italiana', emoji: '🍝', count: 15 },
    { id: 5, name: 'Brasileira', emoji: '🍖', count: 22 },
    { id: 6, name: 'Doces', emoji: '🍰', count: 30 },
    { id: 7, name: 'Bebidas', emoji: '🥤', count: 45 },
    { id: 8, name: 'Saudável', emoji: '🥗', count: 20 }
  ];
}