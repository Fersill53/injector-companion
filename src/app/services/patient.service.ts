import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  docData,
  query,
  where,
  orderBy,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Patient, Treatment } from '../models';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private firestore: Firestore = inject(Firestore);

  // --- Patients ---

  getPatients(userId: string): Observable<Patient[]> {
    const patientsRef = collection(this.firestore, 'patients');
    const q = query(patientsRef, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }) as Observable<Patient[]>;
  }

  getPatient(patientId: string): Observable<Patient> {
    const patientDoc = doc(this.firestore, `patients/${patientId}`);
    return docData(patientDoc, { idField: 'id' }) as Observable<Patient>;
  }

  addPatient(patient: Omit<Patient, 'id' | 'createdAt'>) {
    const patientsRef = collection(this.firestore, 'patients');
    return addDoc(patientsRef, { ...patient, createdAt: serverTimestamp() });
  }

  // --- Treatments (subcollection under each patient) ---

  getTreatments(patientId: string): Observable<Treatment[]> {
    const treatmentsRef = collection(this.firestore, `patients/${patientId}/treatments`);
    const q = query(treatmentsRef, orderBy('sessionDate', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Treatment[]>;
  }

  addTreatment(patientId: string, treatment: Omit<Treatment, 'id' | 'createdAt'>) {
    const treatmentsRef = collection(this.firestore, `patients/${patientId}/treatments`);
    return addDoc(treatmentsRef, { ...treatment, createdAt: serverTimestamp() });
  }
}
