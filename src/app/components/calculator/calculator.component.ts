import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DEFAULT_PRODUCTS, Product } from '../../models';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './calculator.component.html',
})
export class CalculatorComponent {
  products = DEFAULT_PRODUCTS;

  selectedProduct = signal<Product>(this.products[0]);
  dilutionMl = signal<number>(this.products[0].defaultDilutionMl);
  costPerVial = signal<number | null>(null);
  showCost = signal<boolean>(false);

  // Live-computed concentration. This is the number that matters most —
  // everything else on screen supports it.
  unitsPerMl = computed(() => {
    const dilution = this.dilutionMl();
    if (!dilution || dilution <= 0) return 0;
    return this.selectedProduct().unitsPerVial / dilution;
  });

  costPerUnit = computed(() => {
    const cost = this.costPerVial();
    if (!cost || cost <= 0) return null;
    return cost / this.selectedProduct().unitsPerVial;
  });

  selectProduct(product: Product) {
    this.selectedProduct.set(product);
    this.dilutionMl.set(product.defaultDilutionMl);
  }

  onDilutionInput(value: string) {
    const parsed = parseFloat(value);
    this.dilutionMl.set(isNaN(parsed) ? 0 : parsed);
  }

  onCostInput(value: string) {
    const parsed = parseFloat(value);
    this.costPerVial.set(isNaN(parsed) ? null : parsed);
  }

  // Formats to a clean, non-jittery number of decimals for the readout.
  formatUnits(n: number): string {
    if (!isFinite(n) || n === 0) return '—';
    return n % 1 === 0 ? n.toFixed(0) : n.toFixed(2);
  }
}
