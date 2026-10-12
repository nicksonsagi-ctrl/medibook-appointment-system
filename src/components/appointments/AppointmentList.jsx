import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { appointments } from '../../services/api';
import { readableError } from '../../lib/domain';
import { timeZone } from './SlotPicker';
import { Badge, Button, Dialog, Empty, ButtonLink } from '../ui';
export default function AppointmentList({items,reload}) {
 const [cancel,setCancel]=useState(null);const [busy,setBusy]=useState(false);
 async function submit(){setBusy(true);try{await appointments.cancel(cancel.id);toast.success('Appointment cancelled.');setCancel(null);await reload();}catch(e){toast.error(readableError(e));}finally{setBusy(false);}}
 return <>{items.length?<div className="grid gap-4">{items.map(a=><article className="card appointment-card" key={a.id}><div><h3>{a.slot?.doctor?.name||'Doctor unavailable'}</h3><p>{a.slot?.doctor?.specialty}</p><p className="mt-3 font-medium text-slate-700">{format(new Date(a.slot.starts_at),'EEE, MMM d, yyyy')} · {format(new Date(a.slot.starts_at),'h:mm a')} – {format(new Date(a.slot.ends_at),'h:mm a')}</p><p className="text-xs">{timeZone}</p>{a.reason&&<p className="mt-2 whitespace-pre-wrap break-words">Reason: {a.reason}</p>}</div><div className="flex flex-wrap gap-3 items-center"><Badge status={a.status}/>{['pending','confirmed'].includes(a.status)&&<Button variant="outline" onClick={()=>setCancel(a)}>Cancel appointment</Button>}</div></article>)}</div>:<Empty title="No appointments yet" description="Take a small step toward better health. Find a doctor and choose your first appointment." action={<ButtonLink to="/doctors">Find a doctor</ButtonLink>}/>}<Dialog open={!!cancel} onOpenChange={open=>{if(!open&&!busy)setCancel(null);}} title="Cancel this appointment?" description="This will release your appointment time. You can make another booking whenever you’re ready."><div className="flex justify-end gap-3"><Button variant="outline" disabled={busy} onClick={()=>setCancel(null)}>Keep appointment</Button><Button variant="danger" busy={busy} onClick={submit}>Yes, cancel</Button></div></Dialog></>;
}
