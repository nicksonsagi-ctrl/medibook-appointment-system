import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, CalendarDays, CalendarCheck, LogOut, Home } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Logo } from './PublicLayout';
import { useAuth } from '../../contexts/AuthContext';
import { readableError } from '../../lib/domain';
export default function DashboardLayout({admin=false}) {
 const {profile,logout}=useAuth();const location=useLocation();const navigate=useNavigate();
 const links=admin?[["/admin","Dashboard",LayoutDashboard],["/admin/doctors","Doctors",Stethoscope],["/admin/slots","Doctor Slots",CalendarDays],["/admin/appointments","Appointments",CalendarCheck]]:[["/dashboard","Dashboard",LayoutDashboard],["/doctors","Find a doctor",Stethoscope],["/my-appointments","Appointments",CalendarCheck],["/","Home",Home]];
 const title=links.find(([url])=>url===location.pathname)?.[1]||(location.pathname.startsWith('/book/')?'Book an appointment':'Your care');
 async function signOut(){try{await logout();navigate('/');toast.success('You have signed out.');}catch(e){toast.error(readableError(e));}}
 return <div className="dashboard-shell"><a href="#main" className="skip-link">Skip to content</a><aside className="sidebar"><Logo/><p className="sidebar-label">{admin?'CLINIC WORKSPACE':'YOUR HEALTH SPACE'}</p><nav aria-label={admin?'Admin navigation':'Patient navigation'}>{links.map(([url,label,Icon])=><NavLink key={url} to={url} end><Icon size={19}/>{label}</NavLink>)}</nav><div className="sidebar-bottom"><p className="sidebar-label">{admin?'ADMINISTRATOR':'PATIENT ACCOUNT'}</p><button className="sidebar-logout" onClick={signOut}><LogOut size={18}/>Log out</button></div></aside><div className="dashboard-main"><header className="dashboard-topbar"><h2>{title}</h2><div className="topbar-user"><span>{format(new Date(),'EEEE, MMMM d, yyyy')}</span><div className="user-avatar" title={profile?.full_name}>{(profile?.full_name||'User').split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase()}</div><button className="mobile-logout" aria-label="Log out" onClick={signOut}><LogOut size={18}/></button></div></header><main id="main" className="dashboard-content"><Outlet/></main></div></div>;
}
