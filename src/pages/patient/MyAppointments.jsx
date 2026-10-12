import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { appointments } from '../../services/api';
import { statuses } from '../../lib/domain';
import { PageHeading, ButtonLink, Skeleton, ErrorState } from '../../components/ui';
import AppointmentList from '../../components/appointments/AppointmentList';
export default function MyAppointments(){const {user}=useAuth();const data=useAsync(()=>appointments.mine(user.id),[user.id]);const [status,setStatus]=useState('');return <><PageHeading title="My appointments" description="Your care journey, all in one place." action={<ButtonLink to="/doctors">Book an appointment</ButtonLink>}/><div className="toolbar"><select aria-label="Filter by appointment status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option>{statuses.map(s=><option key={s} value={s}>{s[0].toUpperCase()+s.slice(1)}</option>)}</select></div>{data.loading?<Skeleton/>:data.error?<ErrorState error={data.error} retry={data.reload}/>:<AppointmentList items={(data.data||[]).filter(a=>!status||a.status===status)} reload={data.reload}/>}</>;}
