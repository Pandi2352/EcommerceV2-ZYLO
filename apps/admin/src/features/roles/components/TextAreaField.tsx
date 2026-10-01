import React, { useId } from 'react';

export interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
}

/** Compact multi-line field matching `InputField fieldSize="sm"` (the kit has no textarea). */
export const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, helperText, id, rows = 3, ...props }) => {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className="w-full">
      <label htmlFor={fieldId} className="mb-1.5 block text-[13px] font-medium text-zinc-800">
        {label}
      </label>
      <textarea
        id={fieldId}
        rows={rows}
        className="w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
        {...props}
      />
      {helperText && <p className="mt-1 text-xs text-zinc-500">{helperText}</p>}
    </div>
  );
};

export default TextAreaField;
