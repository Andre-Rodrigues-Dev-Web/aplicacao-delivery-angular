import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-neutral-light">
      <!-- Header -->
      <div class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 class="text-3xl font-bold text-neutral-900">Meus Pedidos</h1>
          <p class="text-neutral-600 mt-2">Acompanhe o status dos seus pedidos</p>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Tabs -->
        <div class="flex space-x-1 bg-neutral-100 p-1 rounded-lg mb-8">
          <button 
            (click)="activeTab = 'current'"
            [class]="activeTab === 'current' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'"
            class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors">
            Pedidos Atuais
          </button>
          <button 
            (click)="activeTab = 'history'"
            [class]="activeTab === 'history' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'"
            class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors">
            Histórico
          </button>
        </div>

        <!-- Current Orders -->
        @if (activeTab === 'current') {
          <div class="space-y-6">
            @if (currentOrders.length === 0) {
              <div class="text-center py-12">
                <svg class="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <h3 class="text-lg font-medium text-neutral-900 mb-2">Nenhum pedido ativo</h3>
                <p class="text-neutral-600">Você não tem pedidos em andamento no momento.</p>
              </div>
            } @else {
              @for (order of currentOrders; track order.id) {
                <div class="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                  <!-- Order Header -->
                  <div class="px-6 py-4 border-b border-neutral-200">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 class="text-lg font-semibold text-neutral-900">Pedido #{{ order.id }}</h3>
                        <p class="text-sm text-neutral-600">{{ order.date | date:'dd/MM/yyyy HH:mm' }}</p>
                      </div>
                      <div class="text-left sm:text-right">
                        <span 
                          [class]="getStatusClass(order.status)"
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                          {{ getStatusText(order.status) }}
                        </span>
                        <p class="text-lg font-bold text-neutral-900 mt-1">{{ order.total | currency:'BRL':'symbol':'1.2-2' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Order Progress -->
                  <div class="px-6 py-4">
                    <div class="flex items-center justify-between mb-4 overflow-x-auto">
                      @for (step of orderSteps; track step.id) {
                        <div class="flex flex-col items-center flex-1 min-w-0">
                          <div 
                            [class]="getStepClass(step.id, order.currentStep)"
                            class="w-8 h-8 rounded-full flex items-center justify-center mb-2 flex-shrink-0">
                            @if (step.id < order.currentStep) {
                              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                              </svg>
                            } @else {
                              <span class="text-sm font-medium">{{ step.id }}</span>
                            }
                          </div>
                          <span class="text-xs text-center text-neutral-600 px-1">{{ step.label }}</span>
                        </div>
                        @if (step.id < orderSteps.length) {
                          <div 
                            [class]="step.id < order.currentStep ? 'bg-brand-olive' : 'bg-neutral-300'"
                            class="flex-1 h-1 mx-2 min-w-4">
                          </div>
                        }
                      }
                    </div>
                  </div>

                  <!-- Order Items -->
                  <div class="px-6 py-4 border-t border-neutral-200">
                    <h4 class="font-medium text-neutral-900 mb-3">Itens do pedido</h4>
                    <div class="space-y-2">
                      @for (item of order.items; track item.id) {
                        <div class="flex items-center justify-between">
                          <div class="flex items-center">
                            <span class="text-sm text-neutral-600 w-8 flex-shrink-0">{{ item.quantity }}x</span>
                            <span class="text-sm text-neutral-900">{{ item.name }}</span>
                          </div>
                          <span class="text-sm font-medium text-neutral-900 flex-shrink-0">{{ item.price | currency:'BRL':'symbol':'1.2-2' }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <button class="text-brand-red hover:text-red-600 text-sm font-medium transition-colors">
                        Rastrear Pedido
                      </button>
                      @if (order.status === 'delivered') {
                        <button class="bg-brand-red text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors w-full sm:w-auto">
                          Pedir Novamente
                        </button>
                      }
                    </div>
                  </div>
                </div>
              }
            }
          </div>
        }

        <!-- Order History -->
        @if (activeTab === 'history') {
          <div class="space-y-4">
            @if (orderHistory.length === 0) {
              <div class="text-center py-12">
                <svg class="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <h3 class="text-lg font-medium text-neutral-900 mb-2">Nenhum pedido anterior</h3>
                <p class="text-neutral-600">Você ainda não fez nenhum pedido.</p>
              </div>
            } @else {
              @for (order of orderHistory; track order.id) {
                <div class="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <div>
                      <h3 class="text-lg font-semibold text-neutral-900">Pedido #{{ order.id }}</h3>
                      <p class="text-sm text-neutral-600">{{ order.date | date:'dd/MM/yyyy HH:mm' }}</p>
                    </div>
                    <div class="text-left sm:text-right">
                      <span class="text-lg font-bold text-neutral-900">{{ order.total | currency:'BRL':'symbol':'1.2-2' }}</span>
                      <p class="text-sm text-brand-olive">Entregue</p>
                    </div>
                  </div>
                  
                  <div class="space-y-2 mb-4">
                    @for (item of order.items; track item.id) {
                      <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center">
                          <span class="text-neutral-600 w-8 flex-shrink-0">{{ item.quantity }}x</span>
                          <span class="text-neutral-900">{{ item.name }}</span>
                        </div>
                        <span class="font-medium text-neutral-900 flex-shrink-0">{{ item.price | currency:'BRL':'symbol':'1.2-2' }}</span>
                      </div>
                    }
                  </div>

                  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-neutral-200 gap-3">
                    <button class="text-brand-red hover:text-red-600 text-sm font-medium transition-colors">
                      Ver Detalhes
                    </button>
                    <button class="bg-brand-red text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors w-full sm:w-auto">
                      Pedir Novamente
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        }
      </div>
    </div>
  `
})
export class OrdersComponent {
  activeTab: 'current' | 'history' = 'current';

  orderSteps = [
    { id: 1, label: 'Confirmado' },
    { id: 2, label: 'Preparando' },
    { id: 3, label: 'A caminho' },
    { id: 4, label: 'Entregue' }
  ];

  currentOrders = [
    {
      id: '12345',
      date: new Date('2024-01-15T14:30:00'),
      status: 'preparing',
      currentStep: 2,
      total: 45.90,
      items: [
        { id: 1, name: 'Pizza Margherita', quantity: 1, price: 32.90 },
        { id: 2, name: 'Refrigerante 2L', quantity: 1, price: 8.90 },
        { id: 3, name: 'Taxa de entrega', quantity: 1, price: 4.10 }
      ]
    }
  ];

  orderHistory = [
    {
      id: '12344',
      date: new Date('2024-01-10T19:15:00'),
      total: 28.50,
      items: [
        { id: 1, name: 'Hambúrguer Artesanal', quantity: 1, price: 28.50 }
      ]
    },
    {
      id: '12343',
      date: new Date('2024-01-08T12:45:00'),
      total: 67.80,
      items: [
        { id: 1, name: 'Sushi Combo', quantity: 1, price: 45.90 },
        { id: 2, name: 'Temaki Salmão', quantity: 2, price: 10.95 }
      ]
    }
  ];

  getStatusClass(status: string): string {
    const classes = {
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-yellow-100 text-yellow-800',
      'on_way': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800'
    };
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  getStatusText(status: string): string {
    const texts = {
      'confirmed': 'Confirmado',
      'preparing': 'Preparando',
      'on_way': 'A caminho',
      'delivered': 'Entregue'
    };
    return texts[status as keyof typeof texts] || 'Desconhecido';
  }

  getStepClass(stepId: number, currentStep: number): string {
    if (stepId < currentStep) {
      return 'bg-brand-olive text-white';
    } else if (stepId === currentStep) {
      return 'bg-brand-red text-white';
    } else {
      return 'bg-neutral-300 text-neutral-600';
    }
  }
}