import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { Skeleton } from './components/ui';
const Landing=lazy(()=>import('./pages/public/Landing'));
const Doctors=lazy(()=>import('./pages/public/Doctors'));
const DoctorDetail=lazy(()=>import('./pages/public/DoctorDetail'));
const AuthPage=lazy(()=>import('./pages/auth/AuthPage'));
const NotFound=lazy(()=>import('./pages/public/NotFound'));
const PatientDashboard=lazy(()=>import('./pages/patient/Dashboard'));
const MyAppointments=lazy(()=>import('./pages/patient/MyAppointments'));
const Booking=lazy(()=>import('./pages/patient/Booking'));
const AdminDashboard=lazy(()=>import('./pages/admin/Dashboard'));
const AdminDoctors=lazy(()=>import('./pages/admin/Doctors'));
const AdminSlots=lazy(()=>import('./pages/admin/Slots'));
const AdminAppointments=lazy(()=>import('./pages/admin/Appointments'));
function NavigationReset(){const {pathname}=useLocation();useEffect(()=>{window.scrollTo(0,0);},[pathname]);return null;}
export default function App(){return <BrowserRouter><AuthProvider><NavigationReset/><Suspense fallback={<div className="container page-container"><Skeleton/></div>}><Routes><Route element={<PublicLayout/>}><Route index element={<Landing/>}/><Route path="doctors" element={<Doctors/>}/><Route path="doctors/:id" element={<DoctorDetail/>}/><Route path="login" element={<AuthPage/>}/><Route path="register" element={<AuthPage register/>}/><Route path="forbidden" element={<NotFound forbidden/>}/><Route path="unauthorized" element={<NotFound forbidden/>}/><Route path="*" element={<NotFound/>}/></Route><Route element={<ProtectedRoute role="patient"/>}><Route element={<DashboardLayout/>}><Route path="dashboard" element={<PatientDashboard/>}/><Route path="my-appointments" element={<MyAppointments/>}/><Route path="book/:doctorId" element={<Booking/>}/></Route></Route><Route element={<ProtectedRoute role="admin"/>}><Route element={<DashboardLayout admin/>}><Route path="admin" element={<AdminDashboard/>}/><Route path="admin/doctors" element={<AdminDoctors/>}/><Route path="admin/slots" element={<AdminSlots/>}/><Route path="admin/appointments" element={<AdminAppointments/>}/></Route></Route></Routes></Suspense><Toaster richColors position="top-right"/></AuthProvider></BrowserRouter>;}
