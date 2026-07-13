import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { switchMap, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './patients.component.html',
})
export class PatientsComponent {
  private authService = inject(AuthService);
  private patientService = inject(PatientService);

  patients$ = this.authService.user$.pipe(
    switchMap(user => (user ? this.patientService.getPatients(user.uid) : of([])))
  );

  showAddForm = signal(false);
  displayName = signal('');
  notes = signal('');
  saving = signal(false);
  error = signal<string | null>(null);

  toggleAddForm() {
    this.showAddForm.set(!this.showAddForm());
    this.error.set(null);
  }

  async addPatient() {
    const displayName = this.displayName().trim();
    const userId = this.authService.currentUserId;

    if (!displayName) {
      this.error.set('Enter a patient name.');
      return;
    }
    if (!userId) {
      this.error.set('You need to be signed in to add a patient.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    try {
      await this.patientService.addPatient({
        userId,
        displayName,
        notes: this.notes().trim() || undefined,
      });
      this.displayName.set('');
      this.notes.set('');
      this.showAddForm.set(false);
    } catch {
      this.error.set('Something went wrong. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }
}
