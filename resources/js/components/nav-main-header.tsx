'use client';

import { Link } from '@inertiajs/react';
import { MenuIcon, Moon, Search, Sun } from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useAppearance } from '@/hooks/use-appearance';
import Wrapper from '@/components/wrapper';

const navLinks = [
    { title: 'Home', href: '/' },
    { title: 'Features', href: '/#features' },
    { title: 'Pricing', href: '/pricing' },
    { title: 'About', href: '/about' },
    { title: 'Contact', href: '/contact' },
];

export default function NavMainHeader() {
    const { appearance, updateAppearance } = useAppearance();
    const isDark = appearance === 'dark';

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <Wrapper className="flex min-h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2">
                        <AppLogo />
                    </Link>
                </div>
                <nav className="hidden items-center gap-4 md:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {link.title}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    <div className="relative hidden lg:flex">
                        <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="h-9 w-48 pr-4 pl-9"
                        />
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="size-9"
                    >
                        {isDark ? (
                            <Sun className="h-4 w-4" />
                        ) : (
                            <Moon className="h-4 w-4" />
                        )}
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    <Button asChild>
                        <Link href="/register">Sign up</Link>
                    </Button>
                </div>

                <div className="flex items-center gap-2 md:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="size-9"
                    >
                        {isDark ? (
                            <Sun className="h-4 w-4" />
                        ) : (
                            <Moon className="h-4 w-4" />
                        )}
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9"
                            >
                                <MenuIcon className="h-5 w-5" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="flex flex-col p-4"
                        >
                            <SheetHeader className="p-0">
                                <SheetTitle>
                                    <Link
                                        href="/"
                                        className="flex items-center gap-2"
                                    >
                                        <AppLogo />
                                    </Link>
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="mt-6 flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.title}
                                    </Link>
                                ))}
                            </nav>
                            <div className="mt-auto flex flex-col gap-4">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search..."
                                        className="h-10 w-full pl-9"
                                    />
                                </div>
                                <Button asChild className="w-full">
                                    <Link href="/register">Sign up</Link>
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </Wrapper>
        </header>
    );
}
