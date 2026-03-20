import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export default function Card01({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'rounded-lg border bg-card text-card-foreground shadow-sm',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader01({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn('flex flex-col space-y-1.5 p-6', className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardTitle01({
    className,
    children,
    ...props
}: HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn(
                'text-2xl leading-none font-semibold tracking-tight',
                className,
            )}
            {...props}
        >
            {children}
        </h3>
    );
}

export function CardDescription01({
    className,
    children,
    ...props
}: HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        >
            {children}
        </p>
    );
}

export function CardContent01({ className, children, ...props }: CardProps) {
    return (
        <div className={cn('p-6 pt-0', className)} {...props}>
            {children}
        </div>
    );
}

export function CardFooter01({ className, children, ...props }: CardProps) {
    return (
        <div className={cn('flex items-center p-6 pt-0', className)} {...props}>
            {children}
        </div>
    );
}
