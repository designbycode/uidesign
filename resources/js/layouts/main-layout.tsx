import type { ReactNode } from 'react';

import NavMainHeader from '@/components/nav-main-header';

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative flex min-h-screen flex-col">
            <NavMainHeader />
            <main className="flex-1">{children}</main>
        </div>
    );
}
