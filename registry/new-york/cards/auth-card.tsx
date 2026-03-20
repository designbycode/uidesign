import { Lock} from 'lucide-react'
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AuthCard() {
    return (
        <Card className="shadow-xl">
            <CardHeader className="items-center text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground">
                    <Lock className="h-6 w-6 text-background" />
                </div>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Sign in to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                    />
                </div>
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="remember"
                            className="rounded"
                        />
                        <label
                            htmlFor="remember"
                            className="text-muted-foreground"
                        >
                            Remember me
                        </label>
                    </div>
                    <span className="cursor-pointer text-primary hover:underline">
                        Forgot password?
                    </span>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
                <Button className="w-full">Sign in</Button>
                <p className="text-center text-xs text-muted-foreground">
                    Don't have an account?{' '}
                    <span className="cursor-pointer text-primary hover:underline">
                        Sign up free
                    </span>
                </p>
            </CardFooter>
        </Card>
    );
}
