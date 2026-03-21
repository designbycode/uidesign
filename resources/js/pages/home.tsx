import * as React from 'react';
import MainLayout from '@/layouts/main-layout';
import Wrapper from '@/components/wrapper';

export default function Home() {
    return (
        <MainLayout>
            <Wrapper className="my-12">
                <div className="mb-8">
                    <h1 className="mb-2 text-4xl font-bold">
                        Dropzone Components
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        A collection of avatar and gallery dropzone components
                        for uploading images
                    </p>
                </div>
            </Wrapper>
        </MainLayout>
    );
}
