import { format } from 'date-fns';
import { localDay } from '../../lib/domain';
import { Empty, Field } from '../ui';
export const timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone;
export function SlotPicker({slots,date,onDateChange,selected,onSelect}) {
 const dates=[...new Set(slots.map(s=>localDay(s.starts_at)))];
 const day=date||dates[0]||'';
 const filtered=slots.filter(s=>localDay(s.starts_at)===day);
 return <><p className="zone-note">Dates and times in your local time zone: <strong>{timeZone}</strong></p>{dates.length?<><Field label="Appointment date"><select value={day} onChange={e=>onDateChange(e.target.value)}>{dates.map(d=><option key={d} value={d}>{format(new Date(d+'T12:00:00'),'EEEE, MMMM d, yyyy')}</option>)}</select></Field><div className="slot-grid mt-5" role="group" aria-label="Available appointment times">{filtered.map(s=><button key={s.id} type="button" className={`slot-button ${selected?.id===s.id?'selected':''}`} aria-pressed={selected?.id===s.id} onClick={()=>onSelect(s)}>{format(new Date(s.starts_at),'h:mm a')}<small>to {format(new Date(s.ends_at),'h:mm a')}</small></button>)}</div>{!filtered.length&&<Empty title="No times on this date" description="Choose another date."/>}</>:<Empty title="No available slots" description="This doctor has no open future appointments. Check again later or choose another specialist."/>}</>;
}
