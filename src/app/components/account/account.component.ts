import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './account.component.html',
})
export class AccountComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  fullName = signal('');
  fullNameSaving = signal(false);
  fullNameMessage = signal<string | null>(null);
  fullNameError = signal<string | null>(null);

  newEmail = signal('');
  emailPassword = signal('');
  emailSaving = signal(false);
  emailMessage = signal<string | null>(null);
  emailError = signal<string | null>(null);

  currentPassword = signal('');
  newPassword = signal('');
  passwordSaving = signal(false);
  passwordMessage = signal<string | null>(null);
  passwordError = signal<string | null>(null);

  constructor() {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.fullName.set(user.displayName ?? '');
        this.newEmail.set(user.email ?? '');
      }
    });
  }

  async saveFullName() {
    const fullName = this.fullName().trim();
    if (!fullName) {
      this.fullNameError.set('Enter your full name.');
      return;
    }

    this.fullNameSaving.set(true);
    this.fullNameError.set(null);
    this.fullNameMessage.set(null);

    try {
      await this.authService.updateDisplayName(fullName);
      this.fullNameMessage.set('Name updated.');
    } catch {
      this.fullNameError.set('Something went wrong. Please try again.');
    } finally {
      this.fullNameSaving.set(false);
    }
  }

  async saveEmail() {
    const newEmail = this.newEmail().trim();
    const password = this.emailPassword();
    if (!newEmail || !password) {
      this.emailError.set('Enter your new email and current password.');
      return;
    }

    this.emailSaving.set(true);
    this.emailError.set(null);
    this.emailMessage.set(null);

    try {
      await this.authService.changeEmail(newEmail, password);
      this.emailPassword.set('');
      this.emailMessage.set('Email updated.');
    } catch (err: any) {
      this.emailError.set(this.friendlyError(err?.code));
    } finally {
      this.emailSaving.set(false);
    }
  }

  async savePassword() {
    const currentPassword = this.currentPassword();
    const newPassword = this.newPassword();
    if (!currentPassword || !newPassword) {
      this.passwordError.set('Enter your current and new password.');
      return;
    }

    this.passwordSaving.set(true);
    this.passwordError.set(null);
    this.passwordMessage.set(null);

    try {
      await this.authService.changePassword(newPassword, currentPassword);
      this.currentPassword.set('');
      this.newPassword.set('');
      this.passwordMessage.set('Password updated.');
    } catch (err: any) {
      this.passwordError.set(this.friendlyError(err?.code));
    } finally {
      this.passwordSaving.set(false);
    }
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigateByUrl('/');
  }

  private friendlyError(code: string | undefined): string {
    switch (code) {
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Current password is incorrect.';
      case 'auth/email-already-in-use':
        return 'That email is already in use.';
      case 'auth/invalid-email':
        return 'That email address looks invalid.';
      case 'auth/weak-password':
        return 'New password should be at least 6 characters.';
      case 'auth/requires-recent-login':
        return 'Please sign out and back in, then try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}
