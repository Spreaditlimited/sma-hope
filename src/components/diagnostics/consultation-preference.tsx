'use client';
import * as Select from '@radix-ui/react-select';
import {useId} from 'react';
import styles from './diagnostics.module.css';

type SelectProps = {
  name:string; label:string; defaultValue:string;
  options:ReadonlyArray<{value:string;label:string}>;
  help?:string; disabled?:boolean; required?:boolean; placeholder?:string; compact?:boolean;
};
export function DiagnosticSelectField({name,label,defaultValue,options,help,disabled=false,required=false,placeholder,compact=false}:SelectProps) {
  const id=useId();
  return <div className={compact ? styles.preferenceField : styles.selectField}>
    <label htmlFor={id}>{label}</label>
    <Select.Root name={name} defaultValue={defaultValue} disabled={disabled} required={required}>
      <Select.Trigger id={id} className={`book-marketplace-trigger ${styles.preferenceTrigger}`} aria-describedby={help ? id+'-help' : undefined}>
        <Select.Value placeholder={placeholder}/>
        <Select.Icon className="book-marketplace-chevron"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></Select.Icon>
      </Select.Trigger>
      <Select.Portal><Select.Content className={`book-marketplace-menu ${styles.preferenceMenu}`} position="popper" align="start" sideOffset={6} collisionPadding={16}>
        <Select.Viewport className={styles.selectViewport}>{options.map(option=><Select.Item className="book-marketplace-option" key={option.value} value={option.value}><Select.ItemText>{option.label}</Select.ItemText><Select.ItemIndicator className="book-marketplace-check">✓</Select.ItemIndicator></Select.Item>)}</Select.Viewport>
      </Select.Content></Select.Portal>
    </Select.Root>
    {help && <small id={id+'-help'}>{help}</small>}
  </div>;
}
type PreferenceProps = { name:string; label:string; defaultValue:string; help:string; paidLabel?:string; donatedLabel?:string; disabled?:boolean };
export function ConsultationPreferenceField({paidLabel='Receive the agreed fee by default',donatedLabel='Donate my consultations by default',...props}:PreferenceProps) {
  return <DiagnosticSelectField {...props} compact options={[{value:'paid',label:paidLabel},{value:'donated',label:donatedLabel}]}/>;
}
