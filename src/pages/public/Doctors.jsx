import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { doctors } from '../../services/api';
import { PageHeading, Skeleton, ErrorState, Empty } from '../../components/ui';
import DoctorCard from '../../components/doctors/DoctorCard';
export default function Doctors(){
 const [params,setParams]=useSearchParams();const q=params.get('q')||'';const specialty=params.get('specialty')||'';const data=useAsync(()=>doctors.list(),[]);
 const items=(data.data||[]).filter(d=>(!specialty||d.specialty===specialty)&&`${d.name} ${d.specialty}`.toLowerCase().includes(q.toLowerCase()));
 const specialties=[...new Set((data.data||[]).map(d=>d.specialty))].sort();
 function filter(key,value){const next=new URLSearchParams(params);if(value)next.set(key,value);else next.delete(key);setParams(next,{replace:true});}
 return <div className="container page-container"><PageHeading eyebrow="FIND YOUR CARE TEAM" title="A specialist for your next step" description="Explore our doctors and find the care that’s right for you."/><div className="toolbar"><div className="relative flex-1"><Search size={19} className="absolute top-3.5 left-4 text-slate-400"/><input aria-label="Search doctors by name or specialty" placeholder="Search doctor or specialty" className="pl-12" value={q} onChange={e=>filter('q',e.target.value)}/></div><select aria-label="Filter by specialty" value={specialty} onChange={e=>filter('specialty',e.target.value)}><option value="">All specialties</option>{specialty&&!specialties.includes(specialty)&&<option>{specialty}</option>}{specialties.map(s=><option key={s}>{s}</option>)}</select></div>{data.loading?<Skeleton count={6}/>:data.error?<ErrorState error={data.error} retry={data.reload}/>:items.length?<><p className="text-sm text-slate-500 mb-5">{items.length} {items.length===1?'doctor':'doctors'} available</p><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{items.map(d=><DoctorCard key={d.id} doctor={d}/>)}</div><p className="text-xs text-slate-500 mt-5">Fees are supplied by your clinic. Confirm currency and payment arrangements with your provider.</p></>:<Empty title="No doctors found" description="Try another name or specialty. If the directory is empty, the clinic has not added active doctors yet."/>}</div>;
}
