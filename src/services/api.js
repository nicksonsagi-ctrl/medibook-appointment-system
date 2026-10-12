import { requireSupabase } from '../lib/supabase';
import { isAvailable, allowedTransitions } from '../lib/domain';
async function result(query) { const { data, error } = await query; if(error) throw error; return data; }
// Range through all RLS-visible rows so clinic totals do not silently stop at the API page limit.
async function allRows(factory) {
 const rows=[];const size=500;
 for(let offset=0;;offset+=size){const page=await result(factory().range(offset,offset+size-1));rows.push(...page);if(page.length<size)return rows;}
}
export const doctors = {
 list: (all = false) => allRows(()=> { let q = requireSupabase().from('doctors').select('*').order('name').order('id'); return all ? q : q.eq('active', true); }),
 get: id => result(requireSupabase().from('doctors').select('*').eq('id', id).eq('active', true).single()),
 save: (data, id) => result(id ? requireSupabase().from('doctors').update(data).eq('id', id).select().single() : requireSupabase().from('doctors').insert(data).select().single()),
};
export const slots = {
 async available(doctorId) {
 const now=new Date().toISOString();
 const data = await allRows(()=>requireSupabase().from('doctor_slots').select('*, doctor:doctors!inner(*), appointments(status)').eq('doctor_id', doctorId).eq('doctor.active', true).gt('starts_at', now).order('starts_at').order('id'));
 return data.filter(s => isAvailable(s));
 },
 list: () => {const now=new Date().toISOString();return allRows(()=>requireSupabase().from('doctor_slots').select('*, doctor:doctors(name), appointments(id,status)').gt('starts_at', now).order('starts_at').order('id'));},
 create: data => result(requireSupabase().from('doctor_slots').insert(data).select().single()),
 remove: id => result(requireSupabase().from('doctor_slots').delete().eq('id', id).select('id').single()),
};
const appointmentSelect = '*, slot:doctor_slots!inner(*, doctor:doctors(*))';
export const appointments = {
 mine: id => allRows(()=>requireSupabase().from('appointments').select(appointmentSelect).eq('patient_id', id).order('created_at', {ascending:false}).order('id')),
 async all() {
 const db = requireSupabase();
 const data = await allRows(()=>db.from('appointments').select(appointmentSelect).order('created_at', {ascending:false}).order('id'));
 const ids = [...new Set(data.map(a=>a.patient_id))];
 const profiles=[];
 for(let i=0;i<ids.length;i+=100)profiles.push(...await allRows(()=>db.from('profiles').select('id,full_name,phone').in('id', ids.slice(i,i+100)).order('id')));
 const byId=new Map(profiles.map(p=>[p.id,p]));
 return data.map(a=>({...a, patient:byId.get(a.patient_id)}));
 },
 book: (patient_id, slot_id, reason) => result(requireSupabase().from('appointments').insert({patient_id,slot_id,reason,status:'pending'}).select(appointmentSelect).single()),
 cancel: async id => { const data=await result(requireSupabase().rpc('cancel_my_appointment', {p_appointment_id:id})); if(data===false)throw new Error('This appointment could not be cancelled. Refresh and check its current status.');return data; },
 async status(appointment, status) {
 if(!allowedTransitions(appointment).includes(status)) throw new Error('This appointment cannot move to that status yet.');
 return result(requireSupabase().from('appointments').update({status}).eq('id', appointment.id).eq('status', appointment.status).select().single());
 },
};
