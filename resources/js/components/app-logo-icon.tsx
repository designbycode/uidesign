import type { ClassAttributes, HTMLAttributes } from 'react';
import type { JSX } from 'react/jsx-runtime';
import { cn } from '@/lib/utils';


export default function AppLogoIcon(
    props: JSX.IntrinsicAttributes &
        ClassAttributes<HTMLElement> &
        HTMLAttributes<HTMLElement>,
) {
    return <b className={cn('text-lg font-semibold text-center', props.className)} {...props}>UI</b>;
}
