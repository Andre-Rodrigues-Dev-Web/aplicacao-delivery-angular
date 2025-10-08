import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@delivery-vel/data';
import { UserRole } from '@delivery-vel/data';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('=== ADMIN GUARD DEBUG ===');
  console.log('Admin Guard - Verificando acesso para:', state.url);
  console.log('Admin Guard - Usuário autenticado:', authService.isAuthenticated());
  console.log('Admin Guard - Papel do usuário:', authService.userRole());
  console.log('Admin Guard - UserRole.ADMIN:', UserRole.ADMIN);
  console.log('Admin Guard - É admin (computed):', authService.isAdmin());
  console.log('Admin Guard - Usuário completo:', authService.user());
  console.log('========================');

  // Verificar se o usuário está autenticado
  if (!authService.isAuthenticated()) {
    console.log('❌ Admin Guard - Usuário não autenticado, redirecionando para login');
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Verificar se o usuário é admin
  const userRole = authService.userRole();
  const isAdmin = userRole === UserRole.ADMIN;
  
  console.log('Admin Guard - Comparação:', { userRole, expectedRole: UserRole.ADMIN, isAdmin });
  
  if (!isAdmin) {
    console.log('❌ Admin Guard - Usuário não é admin, redirecionando para home');
    console.log('Admin Guard - Papel atual:', userRole, 'Esperado:', UserRole.ADMIN);
    router.navigate(['/home']);
    return false;
  }

  console.log('✅ Admin Guard - Acesso permitido');
  return true;
};