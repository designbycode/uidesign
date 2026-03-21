import * as React from 'react';
import MainLayout from '@/layouts/main-layout';

export default function Home() {
    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="mb-2 text-4xl font-bold">
                        Dropzone Components
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        A collection of avatar and gallery dropzone components
                        for uploading images
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
