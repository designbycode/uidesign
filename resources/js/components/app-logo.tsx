import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground ">
                <AppLogoIcon className="text-white dark:text-black" />
            </div>
            <div className="-ml-0.5 grid flex-1 text-left text-lg place-content-start mt-0.5">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Design
                </span>
            </div>
        </>
    );
}
