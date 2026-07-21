export interface Product {
  id?: string;
  userId?: string;
  name: string;          // e.g. 'Botox', 'Dysport', 'Xeomin', 'Jeuveau', 'Daxxify'
  unitsPerVial: number;  // e.g. Botox = 100, Dysport = 300
  defaultDilutionMl: number;
  costPerUnit?: number | null;  // set from the Prices screen; clinics bill per unit, not per vial
}

// Starter product list used by the calculator's built-in product picker.
export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'botox', name: 'Botox', unitsPerVial: 100, defaultDilutionMl: 2.5 },
  { id: 'dysport', name: 'Dysport', unitsPerVial: 300, defaultDilutionMl: 1.5 },
  { id: 'xeomin', name: 'Xeomin', unitsPerVial: 100, defaultDilutionMl: 2.5 },
  { id: 'jeuveau', name: 'Jeuveau', unitsPerVial: 100, defaultDilutionMl: 2.5 },
  { id: 'daxxify', name: 'Daxxify', unitsPerVial: 100, defaultDilutionMl: 2.5 },
];

// Seeded into Firestore once per new user (see ProductService.seedIfEmpty),
// so the Prices screen has something to start from instead of an empty list.
export const SEED_PRODUCTS: Omit<Product, 'id' | 'userId'>[] = DEFAULT_PRODUCTS.map(
  ({ id, ...rest }) => ({ ...rest, costPerUnit: null })
);

export interface InjectionSite {
  siteName: string;
  units: number;
}

export interface PatientLastVisit {
  sessionDate: any; // Firestore Timestamp or Date
  productName: string;
  totalUnits: number;
}

export interface Patient {
  id?: string;
  userId: string;
  displayName: string;
  notes?: string;
  createdAt?: any; // Firestore Timestamp
  lastVisit?: PatientLastVisit;
}

export interface Treatment {
  id?: string;
  patientId: string;
  userId: string;
  productName: string;
  dilutionMl: number;
  unitsPerMl: number;
  sessionDate: any;
  notes?: string;
  sites: InjectionSite[];
  createdAt?: any;
}
