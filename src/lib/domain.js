export const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
export const transitions = { pending: ['confirmed', 'cancelled'], confirmed: ['completed', 'cancelled'], completed: [], cancelled: [] };
export function allowedTransitions(appointment) {
 return (transitions[appointment.status] || []).filter(status => status !== 'completed' || new Date(appointment.slot?.ends_at).getTime() <= Date.now());
}
export function isAvailable(slot, now = Date.now()) {
 return new Date(slot.starts_at).getTime() > now && slot.doctor?.active !== false && !(slot.appointments || []).some(a => ['pending', 'confirmed'].includes(a.status));
}
export function readableError(error) {
 if (error?.code === '23505') return 'This slot was just booked by someone else. Please choose another time.';
 if (error?.code === '42501') return 'You do not have permission to perform this action. Check your account access.';
 return error?.message || 'Something went wrong. Please try again.';
}
export function localDay(value) {
 const d = new Date(value); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
