import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { PatientService } from '../../services/patient.service';
import { DEFAULT_PRODUCTS, InjectionSite, Patient, Product, Treatment } from '../../models';

interface SiteComparisonRow {
  siteName: string;
  lastUnits: number | null;
  currentUnits: number | null;
  delta: number | null;
}

@Component({
  selector: 'app-treatments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './treatments.component.html',
})
export class TreatmentsComponent {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private patientService = inject(PatientService);

  patientId = this.route.snapshot.paramMap.get('patientId')!;

  patient = toSignal(this.patientService.getPatient(this.patientId) as Observable<Patient | null>, {
    initialValue: null,
  });
  treatments = toSignal(this.patientService.getTreatments(this.patientId), {
    initialValue: [] as Treatment[],
  });

  lastVisit = computed<Treatment | null>(() => this.treatments()[0] ?? null);

  // Self-heals patients whose history predates the lastVisit field (or fell out of sync).
  private syncLastVisitEffect = effect(() => {
    const patient = this.patient();
    const mostRecent = this.lastVisit();
    if (!patient || !mostRecent) return;

    const stored = patient.lastVisit;
    const inSync =
      stored &&
      stored.productName === mostRecent.productName &&
      this.toMillis(stored.sessionDate) === this.toMillis(mostRecent.sessionDate);

    if (!inSync) {
      this.patientService.syncLastVisit(this.patientId, mostRecent);
    }
  });

  products = DEFAULT_PRODUCTS;
  selectedProduct = signal<Product>(this.products[0]);
  dilutionMl = signal<number>(this.products[0].defaultDilutionMl);
  sessionDate = signal<string>(this.today());
  sites = signal<InjectionSite[]>([{ siteName: '', units: 0 }]);
  notes = signal('');

  saving = signal(false);
  error = signal<string | null>(null);

  unitsPerMl = computed(() => {
    const dilution = this.dilutionMl();
    if (!dilution || dilution <= 0) return 0;
    return this.selectedProduct().unitsPerVial / dilution;
  });

  totalUnits = computed(() => this.sites().reduce((sum, s) => sum + (s.units || 0), 0));

  siteComparison = computed<SiteComparisonRow[]>(() => {
    const last = this.lastVisit();
    const lastSites = new Map<string, { siteName: string; units: number }>();
    if (last) {
      for (const s of last.sites) {
        lastSites.set(s.siteName.trim().toLowerCase(), s);
      }
    }

    const seen = new Set<string>();
    const rows: SiteComparisonRow[] = [];

    for (const s of this.sites()) {
      const name = s.siteName.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      seen.add(key);
      const lastSite = lastSites.get(key);
      rows.push({
        siteName: name,
        currentUnits: s.units,
        lastUnits: lastSite ? lastSite.units : null,
        delta: lastSite ? s.units - lastSite.units : null,
      });
    }

    for (const [key, lastSite] of lastSites) {
      if (!seen.has(key)) {
        rows.push({
          siteName: lastSite.siteName,
          currentUnits: null,
          lastUnits: lastSite.units,
          delta: null,
        });
      }
    }

    return rows;
  });

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private parseLocalDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private toMillis(sessionDate: any): number {
    if (!sessionDate) return 0;
    if (sessionDate.toMillis) return sessionDate.toMillis();
    return new Date(sessionDate).getTime();
  }

  selectProduct(product: Product) {
    this.selectedProduct.set(product);
    this.dilutionMl.set(product.defaultDilutionMl);
  }

  onDilutionInput(value: string) {
    const parsed = parseFloat(value);
    this.dilutionMl.set(isNaN(parsed) ? 0 : parsed);
  }

  addSiteRow() {
    this.sites.set([...this.sites(), { siteName: '', units: 0 }]);
  }

  removeSiteRow(index: number) {
    const next = this.sites().slice();
    next.splice(index, 1);
    this.sites.set(next.length ? next : [{ siteName: '', units: 0 }]);
  }

  updateSiteName(index: number, value: string) {
    const next = this.sites().slice();
    next[index] = { ...next[index], siteName: value };
    this.sites.set(next);
  }

  updateSiteUnits(index: number, value: string) {
    const parsed = parseFloat(value);
    const next = this.sites().slice();
    next[index] = { ...next[index], units: isNaN(parsed) ? 0 : parsed };
    this.sites.set(next);
  }

  async logSession() {
    const userId = this.authService.currentUserId;
    const sites = this.sites().filter(s => s.siteName.trim() && s.units > 0);

    if (!userId) {
      this.error.set('You need to be signed in to log a session.');
      return;
    }
    if (sites.length === 0) {
      this.error.set('Add at least one injection site with units.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const notes = this.notes().trim();

    try {
      await this.patientService.addTreatment(this.patientId, {
        patientId: this.patientId,
        userId,
        productName: this.selectedProduct().name,
        dilutionMl: this.dilutionMl(),
        unitsPerMl: this.unitsPerMl(),
        sessionDate: this.parseLocalDate(this.sessionDate()),
        sites,
        ...(notes ? { notes } : {}),
      });
      this.sites.set([{ siteName: '', units: 0 }]);
      this.notes.set('');
      this.sessionDate.set(this.today());
    } catch {
      this.error.set('Something went wrong. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  formatDate(sessionDate: any): string {
    const date = sessionDate?.toDate ? sessionDate.toDate() : new Date(sessionDate);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
