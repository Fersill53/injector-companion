import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Product, SEED_PRODUCTS } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private firestore: Firestore = inject(Firestore);

  getProducts(userId: string): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    const q = query(productsRef, where('userId', '==', userId), orderBy('name'));
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  addProduct(userId: string, product: Omit<Product, 'id' | 'userId'>) {
    const productsRef = collection(this.firestore, 'products');
    return addDoc(productsRef, { ...product, userId });
  }

  updateProduct(productId: string, changes: Partial<Product>) {
    const productDoc = doc(this.firestore, `products/${productId}`);
    return updateDoc(productDoc, changes);
  }

  // Call once for a new user with no products yet — pushes the standard
  // 5-product starter list so the Prices screen isn't empty on first visit.
  async seedIfEmpty(userId: string): Promise<void> {
    const productsRef = collection(this.firestore, 'products');
    const existing = await getDocs(query(productsRef, where('userId', '==', userId)));
    if (!existing.empty) return;

    for (const product of SEED_PRODUCTS) {
      await addDoc(productsRef, { ...product, userId });
    }
  }
}
