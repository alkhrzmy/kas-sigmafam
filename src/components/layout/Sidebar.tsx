'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/pemasukan', label: 'Pemasukan', icon: '💰' },
    { href: '/pengeluaran', label: 'Pengeluaran', icon: '💸' },
    { href: '/iuran', label: 'Iuran Bulanan', icon: '📅' },
    { href: '/penghuni', label: 'Penghuni', icon: '👥' },
    { href: '/kategori', label: 'Kategori', icon: '🏷️' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center px-4 md:hidden z-40">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-card-hover rounded-lg transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
                <h1 className="text-lg font-bold gradient-text ml-3">💵 Kas Sigma</h1>
            </header>

            {/* Mobile Spacer */}
            <div className="h-14 md:hidden" />

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 md:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo */}
                <div className="p-6 border-b border-border">
                    <h1 className="text-xl font-bold gradient-text">
                        💵 Kas Sigma
                    </h1>
                    <p className="text-sm text-muted mt-1">Kontrakan 8 Orang</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                                    isActive
                                        ? 'bg-primary text-white'
                                        : 'text-muted hover:bg-card-hover hover:text-foreground'
                                )}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-border">
                    <p className="text-xs text-muted text-center">
                        v1.0.0 • Made with ❤️
                    </p>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 md:hidden z-40">
                {navItems.slice(0, 5).map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted'
                            )}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
