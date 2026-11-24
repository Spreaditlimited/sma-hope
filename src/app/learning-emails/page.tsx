import { UnsubscribeLearningEmails } from './unsubscribe';
import type { Metadata } from 'next';
export const metadata:Metadata={title:'Learning email preferences',robots:{index:false,follow:false},referrer:'no-referrer'};
export default async function Page({searchParams}:{searchParams:Promise<{token?:string}>}){const params=await searchParams;return <UnsubscribeLearningEmails token={typeof params.token==='string'?params.token:''}/>;}
