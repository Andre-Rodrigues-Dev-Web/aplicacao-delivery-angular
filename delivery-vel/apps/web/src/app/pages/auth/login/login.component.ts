import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService, UserRole } from '@delivery-vel/data';

@Component({
  selector: 'app-login',
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
            Entre na sua conta
          </h2>
          <p class="mt-2 text-center text-sm text-neutral-600">
            Ou
            <a routerLink="/auth/register" class="font-medium text-brand-red hover:text-red-600 transition-colors">
              crie uma nova conta
            </a>
          </p>
        </div>
        
        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="space-y-4">
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
                  [(ngModel)]="credentials.email"
                  class="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm"
                  placeholder="seu@email.com"
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
                  autocomplete="current-password"
                  required
                  [(ngModel)]="credentials.password"
                  class="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm pr-10"
                  placeholder="Sua senha"
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
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                [(ngModel)]="rememberMe"
                class="h-4 w-4 text-brand-red focus:ring-brand-red border-neutral-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-neutral-900">
                Lembrar de mim
              </label>
            </div>

            <div class="text-sm">
              <a href="#" class="font-medium text-brand-red hover:text-red-600 transition-colors">
                Esqueceu sua senha?
              </a>
            </div>
          </div>

          @if (errorMessage()) {
            <div class="rounded-md bg-red-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <span class="text-red-400">⚠️</span>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">
                    Erro no login
                  </h3>
                  <div class="mt-2 text-sm text-red-700">
                    <p>{{ errorMessage() }}</p>
                  </div>
                </div>
              </div>
            </div>
          }

          <div>
            <button
              type="submit"
              [disabled]="!loginForm.form.valid || isLoading()"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-red hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              @if (isLoading()) {
                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </span>
                Entrando...
              } @else {
                Entrar
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
              <span class="px-2 bg-neutral-light text-neutral-500">Ou continue com</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-neutral-300 rounded-md shadow-sm bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors"
            >
              <span class="sr-only">Entrar com Google</span>
              <span class="text-xl">🔍</span>
            </button>

            <button
              type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-neutral-300 rounded-md shadow-sm bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors"
            >
              <span class="sr-only">Entrar com Facebook</span>
              <span class="text-xl">📘</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  
  rememberMe = false;
  
  // Signals para estado reativo
  private _isLoading = signal(false);
  private _showPassword = signal(false);
  private _errorMessage = signal('');

  readonly isLoading = this._isLoading.asReadonly();
  readonly showPassword = this._showPassword.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  togglePasswordVisibility(): void {
    this._showPassword.set(!this._showPassword());
  }

  onSubmit(): void {
    if (this._isLoading()) return;

    this._isLoading.set(true);
    this._errorMessage.set('');

    console.log('=== LOGIN DEBUG ===');
    console.log('Tentando login com:', { email: this.credentials.email, password: '***' });

    this.authService.login({ email: this.credentials.email, password: this.credentials.password, rememberMe: this.rememberMe })
      .subscribe({
        next: (response) => {
          this._isLoading.set(false);
          
          console.log('✅ Login bem-sucedido:', response);
          console.log('Papel do usuário:', response.user.role);
          console.log('Enum UserRole.ADMIN:', UserRole.ADMIN);
          console.log('É admin?', response.user.role === UserRole.ADMIN);
          
          // Verificar se há uma URL de retorno nos query parameters
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          console.log('Return URL:', returnUrl);
          
          // Se o usuário é admin, sempre redirecionar para admin
          if (response.user.role === UserRole.ADMIN) {
            console.log('🔧 Usuário é admin, redirecionando para /admin');
            console.log('Navegando para /admin...');
            this.router.navigate(['/admin']).then(success => {
              console.log('Navegação para /admin resultado:', success);
              if (!success) {
                console.error('❌ Falha na navegação para /admin');
              }
            });
          } else {
            console.log('👤 Usuário não é admin, redirecionando para:', returnUrl === '/' ? '/home' : returnUrl);
            // Para usuários não-admin, redirecionar para home ou URL específica
            this.router.navigate([returnUrl === '/' ? '/home' : returnUrl]);
          }
        },
        error: (error) => {
          this._isLoading.set(false);
          this._errorMessage.set(error.message || 'Erro ao fazer login. Tente novamente.');
          console.error('❌ Erro no login:', error);
        }
      });
  }
}