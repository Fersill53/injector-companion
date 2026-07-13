import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  user,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: Auth = inject(Auth);

  // Reactive stream of the current user (or null if logged out)
  user$: Observable<any> = user(this.auth);

  signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signOut() {
    return signOut(this.auth);
  }

  updateDisplayName(displayName: string) {
    if (!this.auth.currentUser) throw new Error('Not signed in');
    return updateProfile(this.auth.currentUser, { displayName });
  }

  async changeEmail(newEmail: string, currentPassword: string) {
    const currentUser = this.auth.currentUser;
    if (!currentUser?.email) throw new Error('Not signed in');
    await reauthenticateWithCredential(
      currentUser,
      EmailAuthProvider.credential(currentUser.email, currentPassword)
    );
    return updateEmail(currentUser, newEmail);
  }

  async changePassword(newPassword: string, currentPassword: string) {
    const currentUser = this.auth.currentUser;
    if (!currentUser?.email) throw new Error('Not signed in');
    await reauthenticateWithCredential(
      currentUser,
      EmailAuthProvider.credential(currentUser.email, currentPassword)
    );
    return updatePassword(currentUser, newPassword);
  }

  get currentUserId(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }
}
