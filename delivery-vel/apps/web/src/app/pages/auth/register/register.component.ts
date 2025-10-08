import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@delivery-vel/data';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-neutral-light py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-brand-lime">
            <span class="text-2xl">🍕</span>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-neutral-900">
            Crie sua conta
          </h2>
          <p class="mt-2 text-center text-sm text-neutral-600">
            Ou
            <a routerLink="/auth/login" class="font-medium text-brand-red hover:text-red-600 transition-colors">
              entre na sua conta existente
            </a>
          </p>
        </div>
        
        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-neutral-700">
                Nome completo
              </label>
              <div class="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autocomplete="name"
                  required
                  [(ngModel)]="userData.name"
                  class="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-neutral-700">
                Email
              </label>
              <div class="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  [(ngModel)]="userData.email"
                  class="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-neutral-700">
                Telefone
              </label>
              <div class="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autocomplete="tel"
                  required
                  [(ngModel)]="userData.phone"
                  class="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-neutral-700">
                Senha
              </label>
              <div class="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  [(ngModel)]="userData.password"
                  class="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm pr-10"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  (click)="togglePasswordVisibility()"
                >
                  <span class="text-neutral-400 hover:text-neutral-600">
                    {{ showPassword() ? '🙈' : '👁️' }}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-neutral-700">
                Confirmar senha
              </label>
              <div class="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  [type]="showConfirmPassword() ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  [(ngModel)]="userData.confirmPassword"
                  class="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm pr-10"
                  placeholder="Confirme sua senha"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  (click)="toggleConfirmPasswordVisibility()"
                >
                  <span class="text-neutral-400 hover:text-neutral-600">
                    {{ showConfirmPassword() ? '🙈' : '👁️' }}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              [(ngModel)]="acceptTerms"
              class="h-4 w-4 text-brand-red focus:ring-brand-red border-neutral-300 rounded"
            />
            <label for="terms" class="ml-2 block text-sm text-neutral-900">
              Aceito os 
              <a href="#" class="text-brand-red hover:text-red-600 transition-colors">termos de uso</a> 
              e 
              <a href="#" class="text-brand-red hover:text-red-600 transition-colors">política de privacidade</a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              [disabled]="!registerForm.form.valid || isLoading()"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-red hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              @if (isLoading()) {
                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </span>
                Criando conta...
              } @else {
                Criar conta
              }
            </button>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-neutral-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-neutral-light text-neutral-500">Ou registre-se com</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-neutral-300 rounded-md shadow-sm bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors"
            >
              <span class="sr-only">Registrar com Google</span>
              <span class="text-xl">🔍</span>
            </button>

            <button
              type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-neutral-300 rounded-md shadow-sm bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors"
            >
              <span class="sr-only">Registrar com Facebook</span>
              <span class="text-xl">📘</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  userData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };
  acceptTerms = false;
  
  // Signals para estado reativo
  private _isLoading = signal(false);
  private _showPassword = signal(false);
  private _showConfirmPassword = signal(false);
  private _errorMessage = signal('');

  readonly isLoading = this._isLoading.asReadonly();
  readonly showPassword = this._showPassword.asReadonly();
  readonly showConfirmPassword = this._showConfirmPassword.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility(): void {
    this._showPassword.set(!this._showPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this._showConfirmPassword.set(!this._showConfirmPassword());
  }

  isFormValid(): boolean {
    return !!(
      this.userData.name &&
      this.userData.email &&
      this.userData.phone &&
      this.userData.password &&
      this.userData.confirmPassword &&
      this.userData.password === this.userData.confirmPassword &&
      this.userData.password.length >= 6 &&
      this.acceptTerms
    );
  }

  onSubmit(): void {
    if (this._isLoading() || !this.isFormValid()) return;

    this._isLoading.set(true);
    this._errorMessage.set('');

    this.authService.register({
      name: this.userData.name,
      email: this.userData.email,
      password: this.userData.password,
      phone: this.userData.phone
    }).subscribe({
      next: (response) => {
        this._isLoading.set(false);
        // Registro realizado com sucesso - redirecionar para home
        
        // Redirecionar para a página de login ou inicial
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this._isLoading.set(false);
        this._errorMessage.set(error.message || 'Erro ao criar conta. Tente novamente.');
        console.error('Erro no registro:', error);
      }
    });
  }
}