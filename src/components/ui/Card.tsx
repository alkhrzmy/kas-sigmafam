import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export default function Card({ children, className, hover = false }: CardProps) {
    return (
        <div
            className={cn(
                'bg-card rounded-xl border border-border p-6',
                hover && 'card-hover cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    title: string;
    subtitle?: string;
    icon?: string;
    action?: ReactNode;
}

export function CardHeader({ title, subtitle, icon, action }: CardHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                {icon && <span className="text-2xl">{icon}</span>}
                <div>
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
                </div>
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}
