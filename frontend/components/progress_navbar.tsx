'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
    Image, Navbar, NavbarBrand, NavbarContent, Link, Progress
} from "@heroui/react";
import { logoutUser } from '@/services/auth';

export const ProgressNavigationBar = ({ stage }: { stage: 1 | 2 | 3 | 4 }) => {
    const currentRoute = usePathname()
    const router = useRouter();

    const progressTitle = (stage: 1 | 2 | 3 | 4) => {
        switch (stage) {
            case 1:
                return "1. Describe your post";
            case 2:
                return "2. Browse Suppliers and prices";
            case 3:
                return "3. Choose date & time";
            case 4:
                return "4. Review & Pay";
            default:
                return "Loading...";
        }
    }
    const progressValue = (stage: 1 | 2 | 3 | 4) => {
        switch (stage) {
            case 1:
                return 25;
            case 2:
                return 50;
            case 3:
                return 75;
            case 4:
                return 100;
            default:
                return 100;
        }
    }

    const handleLogOut = () => {
        logoutUser();
        router.replace("/login");
    }
    return (
        <Navbar isBlurred={false} maxWidth="full" position='sticky'
            className="px-28 bg-white"
        >
            <NavbarBrand className='max-w-40 items-center flex-row gap-4'>
                <Image src="https://res.cloudinary.com/dl8zstpix/image/upload/v1741056418/kontask_logo_hsxljn.png" alt="KonTask" width="auto" height={40} />
                <Link href="/home" className="brand-text">KONTASK
                </Link>
            </NavbarBrand>
            <NavbarContent className="hidden sm:flex w-full justify-center">
                <Progress
                    aria-label="Downloading..."
                    className="max-w-full pr-16"
                    color="success"
                    size="sm"
                    radius='sm'
                    label={progressTitle(stage)}
                    value={progressValue(stage)}
                    classNames={{
                        track: "drop-shadow-md border border-default",
                        indicator: "gradient-color",
                        label: "font-medium text-default-600",
                    }}
                />
            </NavbarContent>
        </Navbar>

    );
}