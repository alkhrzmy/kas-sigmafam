import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, id, ...props }, ref) => {
        return (
            <div className="space-y-1">
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-foreground">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={id}
                    className={cn(
                        'w-full px-4 py-2.5 bg-background border border-border rounded-lg',
                        'text-foreground placeholder:text-muted',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                        'transition-all',
                        error && 'border-danger focus:ring-danger',
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-sm text-danger">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
