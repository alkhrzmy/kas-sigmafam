import { cn } from '@/lib/utils';
import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, id, options, ...props }, ref) => {
        return (
            <div className="space-y-1">
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-foreground">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={id}
                    className={cn(
                        'w-full px-4 py-2.5 bg-background border border-border rounded-lg',
                        'text-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                        'transition-all cursor-pointer',
                        error && 'border-danger focus:ring-danger',
                        className
                    )}
                    {...props}
                >
                    <option value="">Pilih...</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <p className="text-sm text-danger">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
