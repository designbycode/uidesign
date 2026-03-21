
import { AvatarDropzoneBadge } from '@/components/avatar-dropzone-badge';
import { AvatarDropzoneCard } from '@/components/avatar-dropzone-card';
import { AvatarDropzoneField } from '@/components/avatar-dropzone-field';
import { AvatarDropzoneGhost } from '@/components/avatar-dropzone-ghost';
import { AvatarDropzoneInline } from '@/components/avatar-dropzone-inline';
import { AvatarDropzoneMinimal } from '@/components/avatar-dropzone-minimal';
import { AvatarDropzoneOutlined } from '@/components/avatar-dropzone-outlined';
import { AvatarDropzoneSortableRow } from '@/components/avatar-dropzone-sortable-row';
import { AvatarDropzoneSortableStack } from '@/components/avatar-dropzone-sortable-stack';
import { AvatarDropzoneSquare } from '@/components/avatar-dropzone-square';

import { GalleryDropzoneCarousel } from '@/components/gallery-dropzone-carousel';
import { GalleryDropzoneCompact } from '@/components/gallery-dropzone-compact';
import { GalleryDropzoneDialog } from '@/components/gallery-dropzone-dialog';
import { GalleryDropzoneList } from '@/components/gallery-dropzone-list';
import { GalleryDropzoneMasonry } from '@/components/gallery-dropzone-masonry';
import { GalleryDropzonePills } from '@/components/gallery-dropzone-pills';
import { GalleryDropzoneSimple } from '@/components/gallery-dropzone-simple';
import { GalleryDropzoneSortableCards } from '@/components/gallery-dropzone-sortable-cards';
import { GalleryDropzoneSortableGrid } from '@/components/gallery-dropzone-sortable-grid';
import { GalleryDropzoneSortableList } from '@/components/gallery-dropzone-sortable-list';
import { GalleryDropzoneTable } from '@/components/gallery-dropzone-table';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import MainLayout from '@/layouts/main-layout';

function AvatarDropzoneSection() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="mb-4 text-2xl font-bold">Avatar Dropzones</h2>
                <p className="mb-6 text-muted-foreground">
                    Single image upload components for avatar/profile photos
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Minimal</CardTitle>
                        <CardDescription>
                            Simple circular avatar with hover overlay
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <AvatarDropzoneMinimal />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Badge</CardTitle>
                        <CardDescription>
                            Avatar with status badge indicator
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <AvatarDropzoneBadge size="md" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Square</CardTitle>
                        <CardDescription>
                            Square shape with progress indicator
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <AvatarDropzoneSquare />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Card</CardTitle>
                        <CardDescription>
                            Card layout with file info and actions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <AvatarDropzoneCard />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Inline</CardTitle>
                        <CardDescription>
                            Horizontal layout with label and description
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <AvatarDropzoneInline />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Field</CardTitle>
                        <CardDescription>
                            Form field style with upload/remove actions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <AvatarDropzoneField />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Outlined</CardTitle>
                        <CardDescription>
                            Dashed border with status icons
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <AvatarDropzoneOutlined />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Ghost</CardTitle>
                        <CardDescription>
                            Minimal with hover reveal overlay
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <AvatarDropzoneGhost />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            Sortable Stack
                        </CardTitle>
                        <CardDescription>
                            Multiple avatars in stack formation with
                            drag-to-reorder
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AvatarDropzoneSortableStack maxAvatars={5} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            Sortable Row
                        </CardTitle>
                        <CardDescription>
                            Team member avatars in list with card styling
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AvatarDropzoneSortableRow maxAvatars={4} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function GalleryDropzoneSection() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="mb-4 text-2xl font-bold">Gallery Dropzones</h2>
                <p className="mb-6 text-muted-foreground">
                    Multiple image upload components for galleries and
                    collections
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Simple</CardTitle>
                        <CardDescription>
                            Basic grid layout with drag-and-drop
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GalleryDropzoneSimple maxFiles={6} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Compact</CardTitle>
                        <CardDescription>
                            Inline thumbnail grid with tooltips
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GalleryDropzoneCompact maxFiles={6} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Pills</CardTitle>
                        <CardDescription>
                            Badge-style pills with image thumbnails
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GalleryDropzonePills maxFiles={6} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">List</CardTitle>
                        <CardDescription>
                            Detailed list with progress bars and status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GalleryDropzoneList maxFiles={6} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Table</CardTitle>
                        <CardDescription>
                            Table view with file details
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GalleryDropzoneTable maxFiles={6} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Masonry</CardTitle>
                        <CardDescription>
                            Multi-column masonry layout preserving aspect ratios
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GalleryDropzoneMasonry maxFiles={9} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Carousel</CardTitle>
                        <CardDescription>
                            Main preview with thumbnail strip navigation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GalleryDropzoneCarousel maxFiles={8} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Dialog</CardTitle>
                        <CardDescription>
                            Modal dialog for focused uploading
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <GalleryDropzoneDialog />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            Sortable Grid
                        </CardTitle>
                        <CardDescription>
                            Grid with drag-to-reorder functionality
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GalleryDropzoneSortableGrid
                            maxFiles={9}
                            enableReorder={true}
                        />
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            Sortable List
                        </CardTitle>
                        <CardDescription>
                            Detailed list with drag handles and status badges
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GalleryDropzoneSortableList
                            maxFiles={8}
                            enableReorder={true}
                        />
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            Sortable Cards
                        </CardTitle>
                        <CardDescription>
                            Card layout with primary image selection and hover
                            controls
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GalleryDropzoneSortableCards
                            maxFiles={8}
                            enableReorder={true}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

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

                <AvatarDropzoneSection />
                <GalleryDropzoneSection />
            </div>
        </MainLayout>
    );
}
