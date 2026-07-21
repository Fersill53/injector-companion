import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models';

@Component({
  selector: 'app-prices',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './prices.component.html',
})
export class PricesComponent {
  private auth = inject(AuthService);
  private productService = inject(ProductService);

  user = toSignal(this.auth.user$, { initialValue: null as any });

  products = toSignal(
    this.auth.user$.pipe(
      switchMap(u => (u ? this.productService.getProducts(u.uid) : of([] as Product[])))
    ),
    { initialValue: [] as Product[] }
  );

  showAddForm = signal(false);
  newName = signal('');
  newUnitsPerVial = signal<number | null>(null);
  newCostPerUnit = signal<number | null>(null);

  vialValue(product: Product): number | null {
    if (!product.costPerUnit || !product.unitsPerVial) return null;
    return product.costPerUnit * product.unitsPerVial;
  }

  onCostChange(product: Product, value: string) {
    const parsed = parseFloat(value);
    const cost = isNaN(parsed) ? null : parsed;
    if (!product.id) return;
    this.productService.updateProduct(product.id, { costPerUnit: cost });
  }

  seedDefaults() {
    const uid = this.user()?.uid;
    if (!uid) return;
    this.productService.seedIfEmpty(uid);
  }

  submitNewProduct() {
    const uid = this.user()?.uid;
    const name = this.newName().trim();
    const unitsPerVial = this.newUnitsPerVial();
    if (!uid || !name || !unitsPerVial) return;

    this.productService.addProduct(uid, {
      name,
      unitsPerVial,
      defaultDilutionMl: 2.5,
      costPerUnit: this.newCostPerUnit(),
    });

    this.newName.set('');
    this.newUnitsPerVial.set(null);
    this.newCostPerUnit.set(null);
    this.showAddForm.set(false);
  }
}
