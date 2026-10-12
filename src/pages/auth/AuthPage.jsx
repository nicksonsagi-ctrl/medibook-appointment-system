import { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { HeartPulse, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { requireSupabase, isConfigured } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Field, Skeleton } from '../../components/ui';
import { readableError } from '../../lib/domain';
export default function AuthPage({register=false}) {
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [verification,setVerification]=useState(false);const [show,setShow]=useState(false);const auth=useAuth();const navigate=useNavigate();const location=useLocation();
 const from=location.state?.from; const destination=auth.role==='admin'?'/admin':(typeof from==='string'&&from.startsWith('/')&&!from.startsWith('//')&&!from.startsWith('/admin')?from:'/dashboard');
 if(auth.loading)return <div className="container page-container"><Skeleton/></div>;
 if(auth.user&&auth.profile)return <Navigate to={destination} replace/>;
 async function submit(event){
 event.preventDefault();setError('');setBusy(true);const fields=new FormData(event.currentTarget);
 try{
 const db=requireSupabase();
 if(register){
 const {data,error}=await db.auth.signUp({email:fields.get('email').trim(),password:fields.get('password'),options:{data:{full_name:fields.get('full_name').trim(),phone:fields.get('phone').trim()},emailRedirectTo:window.location.origin+'/dashboard'}});
 if(error)throw error;
 if(!data.session){setVerification(true);toast.success('Check your email to verify your account.');}else{toast.success('Your account is created.');navigate('/dashboard');}
 }else{
 const {error}=await db.auth.signInWithPassword({email:fields.get('email').trim(),password:fields.get('password')});if(error)throw error;toast.success('Welcome back.');
 }
 }catch(e){setError(readableError(e));}finally{setBusy(false);}
 }
 return <section className="auth-page"><div className="auth-story"><HeartPulse size={43} className="text-teal-600"/><p className="eyebrow mt-8">CARE THAT CONNECTS</p><h2>Your health journey,<br/>a little simpler.</h2><p>Find the right specialist, make time for care, and keep your appointments together.</p><div className="info-row mt-8"><ShieldCheck size={20}/>Private. Personal. Built around you.</div></div><div className="auth-form"><p className="eyebrow">WELCOME TO MEDIBOOK</p><h1>{register?'Make time for your health':'Good to see you again'}</h1><p>{register?'Create your patient account to get started.':'Sign in to manage your appointments.'}</p>{!isConfigured&&<div className="inline-alert mb-5">Supabase is not connected yet. Configure the two VITE_SUPABASE variables in your environment.</div>}{verification?<div role="status" className="card panel"><ShieldCheck className="text-teal-600 mb-4"/><h2>Check your inbox</h2><p>Follow the verification link sent to your email, then sign in. If your email already has an account, use the login page.</p><ButtonLinkLocal/></div>:<form className="form-stack" onSubmit={submit}>{register&&<><Field label="Full name"><input name="full_name" autoComplete="name" required maxLength={120} placeholder="Your full name"/></Field><Field label="Phone number (optional)"><input name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="Your contact number"/></Field></>}<Field label="Email address"><input name="email" type="email" required autoComplete="email" placeholder="you@example.com"/></Field><Field label="Password"><div className="relative"><input name="password" type={show?'text':'password'} minLength={register?8:undefined} required autoComplete={register?'new-password':'current-password'} placeholder={register?'At least 8 characters':'Enter your password'} className="pr-12"/><button type="button" aria-label={show?'Hide password':'Show password'} onClick={()=>setShow(!show)} className="absolute right-4 top-3.5 text-slate-400">{show?<EyeOff size={19}/>:<Eye size={19}/>}</button></div></Field>{register&&<p className="text-xs text-slate-500">Registration creates a patient account only. Clinic administrator access is managed securely outside registration.</p>}{error&&<p role="alert" className="inline-alert">{error}</p>}{auth.error&&<p role="alert" className="inline-alert">Your account or session could not be restored: {readableError(auth.error)}. Ask your clinic administrator to check your profile.</p>}<Button busy={busy} type="submit">{register?'Create patient account':'Sign in'}</Button></form>}<div className="auth-switch">{register?'Already have an account?':'New to MediBook?'} <Link to={register?'/login':'/register'}>{register?'Sign in':'Create an account'}</Link></div></div></section>;
}
function ButtonLinkLocal(){return <Link className="btn btn-primary mt-5" to="/login">Back to sign in</Link>;}
