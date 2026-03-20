import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    className?: string;
}

export default function Button01({className, children, ...props}: ButtonProps  ) {
    return (
        <Button className={cn('bg-sky-500 px-4 py-3 rounded-lg', className)} {...props}>{children}</Button>
    )
}
