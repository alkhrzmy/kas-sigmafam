import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => ReactNode;
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string;
    emptyMessage?: string;
    isLoading?: boolean;
}

export default function Table<T>({
    columns,
    data,
    keyExtractor,
    emptyMessage = 'Tidak ada data',
    isLoading = false,
}: TableProps<T>) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-muted">Memuat...</div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-muted">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={cn(
                                    'px-4 py-3 text-left text-sm font-medium text-muted',
                                    col.className
                                )}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr
                            key={keyExtractor(item)}
                            className="border-b border-border/50 hover:bg-card-hover transition-colors"
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className={cn('px-4 py-3 text-sm', col.className)}
                                >
                                    {col.render
                                        ? col.render(item)
                                        : (item as Record<string, unknown>)[col.key] as ReactNode}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
