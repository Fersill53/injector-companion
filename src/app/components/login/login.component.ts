import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  mode = signal<'login' | 'signup'>(
    this.route.snapshot.queryParamMap.get('mode') === 'signup' ? 'signup' : 'login'
  );
  email = signal('');
  password = signal('');
  error = signal<string | null>(null);
  loading = signal(false);

  toggleMode() {
    this.mode.set(this.mode() === 'login' ? 'signup' : 'login');
    this.error.set(null);
  }

  async submit() {
    const email = this.email().trim();
    const password = this.password();
    if (!email || !password) {
      this.error.set('Enter an email and password.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      if (this.mode() === 'signup') {
        await this.authService.signUp(email, password);
      } else {
        await this.authService.signIn(email, password);
      }
      this.router.navigateByUrl('/home');
    } catch (err: any) {
      this.error.set(this.friendlyError(err?.code));
      this.loading.set(false);
    }
  }

  private friendlyError(code: string | undefined): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with that email already exists.';
      case 'auth/invalid-email':
        return 'That email address looks invalid.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Incorrect email or password.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}
