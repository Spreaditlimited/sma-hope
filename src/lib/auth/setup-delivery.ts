import { AsyncLocalStorage } from 'node:async_hooks';
// Per-request evidence: Better Auth deliberately swallows reset-email errors.
const delivery = new AsyncLocalStorage<{sent:boolean}>();
export function confirmSetupDelivery() { const state=delivery.getStore(); if(state) state.sent=true; }
export async function requireSetupDelivery(send:()=>Promise<unknown>) {
  const state={sent:false};
  await delivery.run(state,send);
  if(!state.sent) throw new Error('Setup email delivery failed.');
}
