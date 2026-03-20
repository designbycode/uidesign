
import MainLayout from '@/layouts/main-layout';
import AuthCard from '@/components/auth-card';


export default function Home() {
    return (
        <MainLayout>
            <h1>Home</h1>
            <div className="max-w-xl">

                <AuthCard />
            </div>
        </MainLayout>
    )
}
