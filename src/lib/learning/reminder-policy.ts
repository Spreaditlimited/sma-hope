export const reminderKeys = ['welcome','enrol','start','resume','finish','final','complete'] as const;
export type ReminderKey = typeof reminderKeys[number];
export type Delivery = { key: string; at: number; status: string };
export type Journey = {
 enabled: boolean; active: boolean; pausedUntil: number; optedAt: number; createdAt: number;
 enrolledAt: number | null; lastActivity: number; started: boolean; completed: number;
 completedAt: number; nextLesson: string; deliveries: Delivery[];
};
const day = 86400000;
export function nextReminder(j: Journey, now: number): ReminderKey | null {
 if (!j.enabled || !j.active || j.pausedUntil > now || !Number.isFinite(j.optedAt)) return null;
 const seen = (key: string) => j.deliveries.some(d => d.key === key);
 // Reserved/uncertain deliveries count too: SMTP acceptance can be ambiguous. Never blindly resend.
 if (j.completed >= 5) return !seen('complete') && j.completedAt >= j.optedAt ? 'complete' : null;
 const recent = j.deliveries.filter(d => d.at > now - 7 * day);
 if (recent.length >= 2 || recent.some(d => d.at > now - 3 * day)) return null;
 const since = Math.max(j.optedAt, j.enrolledAt ?? j.createdAt, j.lastActivity);
 const idle = now - since;
 const reminders = j.deliveries.filter(d => !['welcome','complete'].includes(d.key) && d.at > now - 30 * day);
 if (reminders.length >= 3 || seen('final')) return null;
 if (idle >= 14 * day) return 'final';
 if (!j.enrolledAt) return idle >= day && !seen('enrol') ? 'enrol' : null;
 if (!seen('welcome') && now - j.enrolledAt < day) return 'welcome';
 if (!j.started) return idle >= day && !seen('start') ? 'start' : null;
 if (idle < 3 * day) return null;
 if (j.completed === 4 && !seen('finish')) return 'finish';
 return !seen('resume') ? 'resume' : null;
}
export function reminderMessage(key: ReminderKey, site: string, token: string, lesson = '') {
 const origin = new URL(site).origin;
 const resume = new URL('/account/learn', origin);
 if (lesson) resume.searchParams.set('lesson', lesson);
 resume.searchParams.set('utm_source','smahope'); resume.searchParams.set('utm_medium','email'); resume.searchParams.set('utm_campaign','learning-reminders');
 const unsubscribe = new URL('/learning-emails', origin); unsubscribe.searchParams.set('token', token);
 const messages: Record<ReminderKey,{subject:string;heading:string;copy:string;label:string}> = {
 welcome:{subject:'Welcome to your free SMA Hope course',heading:'Start with understanding.',copy:'Your place in Understanding SMA is ready. There are five short video lessons, with a few questions after each one. You can take them at your own pace. Begin with what SMA is, then learn about possible signs and the next steps to seek help.',label:'Begin the course'},
 enrol:{subject:'Your free course is ready when you are',heading:'Take the first small step.',copy:'You have created your SMA Hope account. The next step is to enrol in Understanding SMA. It is free, and all five lessons are available at your pace. No payment details are needed.',label:'Enrol and start learning'},
 start:{subject:'Ready for your first short lesson?',heading:'Begin with what SMA is.',copy:'You enrolled in Understanding SMA but have not started a lesson yet. The first video explains what spinal muscular atrophy is in plain language. You do not need to finish everything in one sitting.',label:'Start lesson one'},
 resume:{subject:'Continue your SMA Hope course when it suits you',heading:'Pick up where you stopped.',copy:'There is no need to start again. Your place is saved in Understanding SMA. Watch your next unfinished lesson and try its short questions when you are ready. If anything is getting in the way, reply to this email and we will try to help.',label:'Continue learning'},
 finish:{subject:'One more lesson to complete your course',heading:'You are nearly there.',copy:'You have completed four of the five lessons in Understanding SMA. One more lesson and its short questions will finish the course. Your saved progress is waiting whenever you have a little time.',label:'Finish the final lesson'},
 final:{subject:'Your course will still be here',heading:'Come back when you are ready.',copy:'It has been a little while since your last step in Understanding SMA. Your account and saved progress are still available. This is our last reminder for this course, so you can return in your own time.',label:'Return to the course'},
 complete:{subject:'You have completed Understanding SMA',heading:'Thank you for taking the time.',copy:'You have completed all five lessons and their short checks in Understanding SMA. We hope the course has helped you understand SMA and the steps to seek appropriate help. Reply to tell us what was useful or what we could explain more clearly. If someone else would benefit, share the free course: '+origin+'/learn/understanding-sma',label:'Revisit your lessons'},
 };
 const m=messages[key];
 return {...m,url:resume.href,unsubscribe:unsubscribe.href,text:`Hello,\n\n${m.copy}\n\n${resume.href}\n\nYou chose learning emails from SMA Hope. These are separate from fundraising updates.\nStop learning emails: ${unsubscribe.href}\nManage or pause reminders: ${origin}/account/email-preferences`};
}
