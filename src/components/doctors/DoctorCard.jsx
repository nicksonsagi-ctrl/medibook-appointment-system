import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Stethoscope, GraduationCap } from 'lucide-react';
export function DoctorAvatar({doctor,className=''}) {
 const [failed,setFailed]=useState(false);
 useEffect(()=>setFailed(false),[doctor.image_url]);
 return doctor.image_url&&!failed?<img className={`doctor-avatar ${className}`} src={doctor.image_url} alt={doctor.name} loading="lazy" onError={()=>setFailed(true)}/>:<div className={`doctor-avatar avatar-fallback ${className}`} role="img" aria-label={doctor.name}><Stethoscope size={34}/></div>;
}
export default function DoctorCard({doctor}) {return <article className="card doctor-card"><div className="doctor-card-top"><DoctorAvatar doctor={doctor}/><span className="specialty-pill">{doctor.specialty}</span></div><div className="doctor-card-body"><h3>{doctor.name}</h3><p className="doctor-qualification"><GraduationCap size={16}/>{doctor.qualification||'Medical specialist'}</p><p className="text-slate-500 text-sm mt-3">{doctor.experience_years} years of experience</p><div className="doctor-card-bottom"><div><span className="text-xs text-slate-500">Consultation fee</span><p className="font-bold">{Number(doctor.consultation_fee).toLocaleString()} <span className="text-xs font-normal text-slate-500">/ visit*</span></p></div><Link to={`/doctors/${doctor.id}`} className="icon-link" aria-label={`View ${doctor.name}`}><ArrowUpRight size={21}/></Link></div></div></article>;}
