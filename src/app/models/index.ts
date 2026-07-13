export interface Product {
  id: string;
  name: string;          // e.g. 'Botox', 'Dysport', 'Xeomin', 'Jeuveau', 'Daxxify'
  unitsPerVial: number;  // e.g. Botox = 100, Dysport = 300
  defaultDilutionMl: number;
  costPerVial?: number;  // optional, enables cost-per-unit math
}

// Starter product list — edit freely, or move to Firestore later if you want
// per-injector custom pricing.
export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'botox', name: 'Botox', unitsPerVial: 100, defaultDilutionMl: 2.5 },
  { id: 'dysport', name: 'Dysport', unitsPerVial: 300, defaultDilutionMl: 1.5 },
  { id: 'xeomin', name: 'Xeomin', unitsPerVial: 100, defaultDilutionMl: 2.5 },
  { id: 'jeuveau', name: 'Jeuveau', unitsPerVial: 100, defaultDilutionMl: 2.5 },
  { id: 'daxxify', name: 'Daxxify', unitsPerVial: 100, defaultDilutionMl: 2.5 },
];

export interface InjectionSite {
  siteName: string;
  units: number;
}

export interface Patient {
  id?: string;
  userId: string;
  displayName: string;
  notes?: string;
  createdAt?: any; // Firestore Timestamp
}

export interface Treatment {
  id?: string;
  patientId: string;
  userId: string;
  productName: string;
  dilutionMl: number;
  unitsPerMl: number;
  sessionDate: any;   // Firestore Timestamp or Date
  notes?: string;
  sites: InjectionSite[];
  createdAt?: any;
}
