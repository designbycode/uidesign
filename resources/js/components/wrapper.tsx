import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { cn } from '@/lib/utils';

export default function Wrapper<T extends ElementType = 'div'>({
    as,
    children,
    className,
}: {
    as?: T;
    children: ComponentPropsWithoutRef<T>['children'];
    className?: string;
} & ComponentPropsWithoutRef<T>) {
    const Component = as ?? 'div';

    return (
        <Component
            className={cn(
                'container mx-auto w-full px-4 sm:px-6 lg:px-8',
                className,
            )}
        >
            {children}
        </Component>
    );
}
