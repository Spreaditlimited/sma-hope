export const supportCategories = [{"id": "education", "title": "Education and learning", "intro": "Help people find clear information and complete our free SMA course."}, {"id": "diagnosis", "title": "Assessment and diagnosis", "intro": "Help families move from a concern to clinical assessment and appropriate testing."}, {"id": "equipment", "title": "Equipment and everyday care", "intro": "Support equipment selected for the person, their home and their care plan."}, {"id": "nutrition", "title": "Nutrition and feeding", "intro": "Support prescribed nutrition, feeding supplies and professional follow-up."}, {"id": "procedures", "title": "Feeding access and procedures", "intro": "Help cover assessment, hospital care and feeding-tube procedures where recommended."}, {"id": "family-support", "title": "Family support and rehabilitation", "intro": "Help families attend appointments, learn care skills and access rehabilitation."}] as const;
export type SupportCategory = typeof supportCategories[number]["id"];
export type SupportItem = {
 supplierName?:string;
 id:string; title:string; category:SupportCategory; description:string; costNaira:number|null; costUsd?:number|null; unit:string;
 image:string; imageAlt:string; included:string; costNote:string; costBasis:"supplier_estimate"|"programme_fee"|"confirmed_quote"|"planning_estimate"|"pending";
 priceDate:string; status:"active"|"paused"|"draft"; sortOrder:number; revision:number;
};
export function formatNaira(value:number) { return new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",minimumFractionDigits:0,maximumFractionDigits:2}).format(value); }
export function supportImageAllowed(value:string) {
 if(!value)return true;
 if(/^\/support\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/.test(value))return true;
 try {const u=new URL(value);return u.protocol==="https:" && u.hostname==="res.cloudinary.com" && !u.username && !u.password && !u.port && /^\/[a-zA-Z0-9_-]+\/image\/upload\//.test(u.pathname) && !/\.svg(?:$|\?)/i.test(u.pathname);}catch{return false;}
}
function text(value:unknown,max:number,required=false):string {
 if(typeof value!=="string" || value.length>max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))throw new Error("Check the item text and field lengths.");
 const result=value.trim();if(required && !result)throw new Error("Complete the required fields.");return result;
}
export function supportItemInput(raw:unknown):SupportItem {
 if(!raw || typeof raw!=="object" || Array.isArray(raw))throw new Error("Invalid support item.");
 const p=raw as Record<string,unknown>;
 const item={supplierName:text(p.supplierName??"",180),id:text(p.id,80,true),title:text(p.title,100,true),category:p.category as SupportCategory,description:text(p.description,900,true),costNaira:p.costNaira as number|null,costUsd:(p.costUsd??null) as number|null,unit:text(p.unit,80,true),image:text(p.image,1500),imageAlt:text(p.imageAlt,180),included:text(p.included,1000),costNote:text(p.costNote,1500,true),costBasis:p.costBasis as SupportItem["costBasis"],priceDate:text(p.priceDate,10),status:p.status as SupportItem["status"],sortOrder:p.sortOrder as number,revision:p.revision as number};
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || !supportCategories.some(c=>c.id===item.category) || !["active","paused","draft"].includes(item.status) || !["supplier_estimate","programme_fee","confirmed_quote","planning_estimate","pending"].includes(item.costBasis))throw new Error("Check the category, URL name and publication status.");
 if(!Number.isSafeInteger(item.revision) || item.revision<0 || !Number.isSafeInteger(item.sortOrder) || item.sortOrder<0 || item.sortOrder>10000)throw new Error("Invalid revision or display order.");
 if(item.costNaira!==null && (typeof item.costNaira!=="number" || !Number.isFinite(item.costNaira) || item.costNaira<1 || item.costNaira>100000000 || Math.abs(item.costNaira*100-Math.round(item.costNaira*100))>0.000001))throw new Error("Enter a valid naira cost, or leave it blank.");
 if(item.costUsd!==null && (typeof item.costUsd!=="number" || !Number.isFinite(item.costUsd) || item.costUsd<0.01 || item.costUsd>10000000 || Math.abs(item.costUsd*100-Math.round(item.costUsd*100))>0.000001))throw new Error("Enter a valid US dollar cost, or leave it blank.");
 if(item.costNaira!==null && item.costUsd!==null)throw new Error("Use one cost currency per item. Do not enter an assumed exchange rate.");
 if((item.costNaira===null && item.costUsd===null)!==(item.costBasis==="pending"))throw new Error("A pending price must be blank; priced items need a cost basis.");
 if(item.priceDate && (!/^\d{4}-\d{2}-\d{2}$/.test(item.priceDate) || new Date(item.priceDate).toISOString().slice(0,10)!==item.priceDate || item.priceDate>new Date().toISOString().slice(0,10)))throw new Error("Enter a valid price date that is not in the future.");
 if((item.costNaira!==null || item.costUsd!==null) && !item.priceDate)throw new Error("Add the date the price was obtained.");
 if(!supportImageAllowed(item.image) || (item.image && !item.imageAlt))throw new Error("Use an SMA Hope support image or a Cloudinary image URL, with an image description.");
 return item;
}
export function supportPreference(item:SupportItem) {
 if(item.status!=="active")throw new Error("This support option is not accepting donations. Please choose another option.");
 return {id:item.id,title:item.title,category:item.category,costNaira:item.costNaira,costUsd:item.costUsd??null,unit:item.unit,costBasis:item.costBasis,priceDate:item.priceDate,revision:item.revision,allocation:"preference_not_restriction"};
}

// Procurement details stay in the administrator workspace, never public page props or checkout metadata.
export function publicSupportItem(item:SupportItem) {
 const {supplierName,...publicItem}=item;
 void supplierName;
 return publicItem;
}

export function supportCostLabel(item:Pick<SupportItem,"costNaira"|"costUsd">) {
 if(item.costNaira!==null)return formatNaira(item.costNaira);
 if(item.costUsd!=null)return `US$${new Intl.NumberFormat("en-US",{maximumFractionDigits:2}).format(item.costUsd)}`;
 return "Cost being confirmed";
}
