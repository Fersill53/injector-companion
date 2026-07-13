import { Routes } from '@angular/router';
import { CalculatorComponent } from './components/calculator/calculator.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PatientsComponent } from './components/patients/patients.component';
import { AccountComponent } from './components/account/account.component';
import { TreatmentsComponent } from './components/treatments/treatments.component';
import { PricesComponent } from './components/prices/prices.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: DashboardComponent },
  { path: 'calculator', component: CalculatorComponent },
  { path: 'patients', component: PatientsComponent },
  { path: 'patients/:patientId/treatments', component: TreatmentsComponent },
  { path: 'account', component: AccountComponent },
  { path: 'prices', component: PricesComponent },
];
