interface InputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  step?: string;
}

export function FormInput({
  label, value, onChange, type = 'text', placeholder, required, min, step
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-[#9ca3af]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="bg-[#374151] border border-[#4b5563] rounded-lg px-3 py-2.5 text-[#f9fafb] text-sm outline-none focus:border-[#16a34a] transition-colors placeholder:text-[#6b7280]"
      />
    </div>
  );
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}

export function FormTextArea({ label, value, onChange, placeholder, rows = 3 }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-[#9ca3af]">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="bg-[#374151] border border-[#4b5563] rounded-lg px-3 py-2.5 text-[#f9fafb] text-sm outline-none focus:border-[#16a34a] transition-colors placeholder:text-[#6b7280] resize-none"
      />
    </div>
  );
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

export function FormSelect({ label, value, onChange, options }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-[#9ca3af]">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-[#374151] border border-[#4b5563] rounded-lg px-3 py-2.5 text-[#f9fafb] text-sm outline-none focus:border-[#16a34a] transition-colors"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function FormToggle({ label, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-[#f9fafb]">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${checked ? 'bg-[#16a34a]' : 'bg-[#374151]'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}
