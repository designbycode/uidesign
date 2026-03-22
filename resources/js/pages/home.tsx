import * as React from 'react';
import { AvatarDropzoneCard } from '@/components/avatar-dropzone-card';
import { GalleryDropzoneSimple } from '@/components/gallery-dropzone-simple';
import Wrapper from '@/components/wrapper';
import MainLayout from '@/layouts/main-layout';
import { SingleImageDrop } from '@/components/single-image-drop';

export default function Home() {
    return (
        <MainLayout>
            <Wrapper as={`main`} className="my-12">
                <div className="mb-8">
                    <h1 className="mb-2 text-4xl font-bold">
                        Dropzone Components
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        A collection of avatar and gallery dropzone components
                        for uploading images
                    </p>

                    <div className="my-6 grid grid-cols-3 gap-4">
                        <GalleryDropzoneSimple maxFiles={4} />
                        <AvatarDropzoneCard />
                        <SingleImageDrop />
                    </div>
                </div>
            </Wrapper>
        </MainLayout>
    );
}
