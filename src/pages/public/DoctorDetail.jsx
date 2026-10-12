import { useParams } from 'react-router-dom';
import { GraduationCap, BriefcaseBusiness, CalendarDays, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { doctors,slots } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { DoctorAvatar } from '../../components/doctors/DoctorCard';
import { SlotPicker } from '../../components/appointments/SlotPicker';
import { Badge, ButtonLink, Empty, ErrorState, Skeleton } from '../../components/ui';
export default function DoctorDetail(){
 const {id}=useParams();const [date,setDate]=useState('');const [selected,setSelected]=useState(null);const doctor=useAsync(()=>doctors.get(id),[id]);const availability=useAsync(()=>slots.available(id),[id]);
 if(doctor.loading)return <div className="container page-container"><Skeleton/></div>;
 if(doctor.error)return <div className="container page-container"><ErrorState error={doctor.error} retry={doctor.reload}/><ButtonLink to="/doctors" variant="outline" className="mt-5">Back to doctors</ButtonLink></div>;
 const d=doctor.data;
 if(!d)return <Empty title="Doctor not found"/>;
 return <div className="container page-container"><ButtonLink to="/doctors" variant="ghost" className="mb-6"><ArrowLeft size={16}/>All doctors</ButtonLink><div className="doctor-detail"><div className="card detail-card"><div className="profile-header"><DoctorAvatar doctor={d}/><div><Badge>{d.specialty}</Badge><h1 className="mt-3">{d.name}</h1></div></div><div className="info-row"><GraduationCap size={18}/>{d.qualification||'Medical specialist'}</div><div className="info-row"><BriefcaseBusiness size={18}/>{d.experience_years} years of experience</div><h2 className="text-xl font-semibold mt-8 mb-3">About your doctor</h2><p className="text-sm text-slate-500 whitespace-pre-line">{d.bio||'Contact the clinic to learn more about this doctor’s approach to care.'}</p><h2 className="text-xl font-semibold mt-8 mb-5">Available appointments</h2>{availability.loading?<Skeleton count={1}/>:availability.error?<ErrorState error={availability.error} retry={availability.reload}/>:<SlotPicker slots={availability.data||[]} date={date} onDateChange={d=>{setDate(d);setSelected(null);}} selected={selected} onSelect={setSelected}/>}</div><aside className="card panel h-fit"><CalendarDays className="text-teal-600 mb-4"/><h2>Your next step to better health</h2><p className="text-sm text-slate-500">Consultation fee</p><p className="text-3xl font-bold my-2">{Number(d.consultation_fee).toLocaleString()}</p><p className="text-xs text-slate-500 mb-6">Per consultation. Confirm currency and payment details with your clinic.</p><ButtonLink to={`/book/${d.id}${selected?`?slot=${selected.id}`:''}`} className="w-full">Book an appointment</ButtonLink><p className="text-xs text-slate-400 mt-4">A patient account is required. Your clinic confirms booking requests.</p></aside></div></div>;
}
