import test from 'node:test';
import assert from 'node:assert/strict';
import { isAvailable,allowedTransitions,readableError,localDay } from '../src/lib/domain.js';
test('availability excludes elapsed, inactive, and reserved slots, while cancelled bookings release slots',()=>{
 const now=Date.now();const slot={starts_at:new Date(now+60000).toISOString(),doctor:{active:true},appointments:[]};
 assert.equal(isAvailable(slot,now),true);
 for(const status of ['pending','confirmed'])assert.equal(isAvailable({...slot,appointments:[{status}]},now),false);
 assert.equal(isAvailable({...slot,appointments:[{status:'cancelled'}]},now),true);
 assert.equal(isAvailable({...slot,doctor:{active:false}},now),false);
 assert.equal(isAvailable({...slot,starts_at:new Date(now-1).toISOString()},now),false);
});
test('lifecycle blocks completion before visit ends and all terminal transitions',()=>{
 assert.deepEqual(allowedTransitions({status:'pending'}),['confirmed','cancelled']);
 assert.deepEqual(allowedTransitions({status:'confirmed',slot:{ends_at:new Date(Date.now()+60000)}}),['cancelled']);
 assert.deepEqual(allowedTransitions({status:'confirmed',slot:{ends_at:new Date(Date.now()-60000)}}),['completed','cancelled']);
 for(const status of ['completed','cancelled','invalid'])assert.deepEqual(allowedTransitions({status}),[]);
});
test('unique conflicts have a patient-friendly actionable message',()=>{assert.match(readableError({code:'23505'}),/already|just booked/);});
test('local date grouping uses local calendar components',()=>{assert.equal(localDay(new Date(2026,0,3,23,45)),'2026-01-03');});
