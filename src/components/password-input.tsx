"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { Icon } from "@/components/icon";

export function PasswordInput({
  id,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <span className="password-field">
      <input {...props} id={inputId} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="password-toggle"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={inputId}
        title={visible ? "Hide password" : "Show password"}
        disabled={props.disabled}
        onClick={() => setVisible((current) => !current)}
      >
        <Icon name={visible ? "eyeOff" : "eye"} />
      </button>
    </span>
  );
}
