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
  writeBatch,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Patient, PatientLastVisit, Treatment } from '../models';

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
    const newTreatmentRef = doc(treatmentsRef);
    const patientRef = doc(this.firestore, `patients/${patientId}`);

    const batch = writeBatch(this.firestore);
    batch.set(newTreatmentRef, { ...treatment, createdAt: serverTimestamp() });
    batch.update(patientRef, { lastVisit: this.buildLastVisit(treatment) });

    return batch.commit();
  }

  // Backfills lastVisit for patients whose history predates that field.
  syncLastVisit(patientId: string, mostRecentTreatment: Treatment) {
    const patientRef = doc(this.firestore, `patients/${patientId}`);
    return updateDoc(patientRef, { lastVisit: this.buildLastVisit(mostRecentTreatment) });
  }

  private buildLastVisit(treatment: Pick<Treatment, 'sessionDate' | 'productName' | 'sites'>): PatientLastVisit {
    return {
      sessionDate: treatment.sessionDate,
      productName: treatment.productName,
      totalUnits: treatment.sites.reduce((sum, s) => sum + s.units, 0),
    };
  }
}
