import React from "react";
export function Field({
  name,
  label,
  value = "",
  type = "text",
  required = false,
  maxLength = 2000,
}: {
  name: string;
  label: string;
  value?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label>
      {label}
      {required ? " *" : ""}
      <input
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        maxLength={maxLength}
      />
    </label>
  );
}
