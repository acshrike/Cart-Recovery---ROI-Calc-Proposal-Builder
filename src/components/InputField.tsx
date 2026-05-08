import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
  type?: string;
  options?: { label: string; value: string }[];
  isTextArea?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  hint, 
  error,
  type = 'text', 
  options, 
  isTextArea, 
  className,
  onClick,
  ...props 
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<any>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  return (
    <div className={cn("flex flex-col", className)} onClick={onClick}>
      <div className="flex justify-between items-end mb-1.5">
        <label className="label mb-0">{label}</label>
        {error && <span className="text-[9px] font-bold text-red uppercase tracking-tight">{error}</span>}
      </div>
      {options ? (
        <div className="relative">
          <select 
            className={cn(
              "input-field appearance-none w-full",
              error && "border-red/40 bg-red/5 focus:border-red focus:ring-red/10"
            )}
            {...props}
            onKeyDown={handleKeyDown}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/50 pointer-events-none" />
        </div>
      ) : isTextArea ? (
        <textarea 
          className={cn(
            "input-field min-h-[100px] resize-y",
            error && "border-red/40 bg-red/5 focus:border-red focus:ring-red/10"
          )}
          {...props}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <input 
          type={type}
          className={cn(
            "input-field",
            error && "border-red/40 bg-red/5 focus:border-red focus:ring-red/10"
          )}
          {...props}
          onKeyDown={handleKeyDown}
        />
      )}
      {hint && !error && <span className="text-[10px] text-accent/40 mt-1.5 leading-tight">{hint}</span>}
    </div>
  );
};

export default InputField;
