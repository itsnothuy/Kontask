'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
    Dropdown, DropdownTrigger, Image, DropdownMenu, DropdownItem, Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Avatar, Tooltip
} from "@heroui/react";
import { HomeIcon, AddIcon, ProfileIcon, DatabaseIcon, NotificationIcon, MessageIcon } from "./icons/page";
import { logoutUser } from '@/services/auth';

export const NavigationBar = ({ isAuthPage = true }) => {
    const currentRoute = usePathname()
    const router = useRouter();

    const handleLogOut = () => {
        logoutUser();
        router.replace("/login");
    }
    return isAuthPage ? (
        <Navbar isBlurred isBordered maxWidth="full" height="4.5rem">
            <NavbarBrand className="items-center flex-row gap-4">
                <Image src="https://res.cloudinary.com/dl8zstpix/image/upload/v1741056418/kontask_logo_hsxljn.png" alt="KonTask" width="auto" height={40} />
                <Link href="/home" className="brand-text">KONTASK
                </Link>
            </NavbarBrand>
            <NavbarContent justify="end">
                <NavbarItem>
                    <Button as={Link} color="primary" href="login" className="gradient-button">
                        Login
                    </Button>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    ) : (
        <Navbar isBlurred={false} maxWidth="full" position='sticky'
            className="px-28 bg-white"
            classNames={{
                item: [
                    "flex",
                    "relative",
                    "h-full",
                    "items-center",
                    "data-[active=true]:after:content-['']",
                    "data-[active=true]:after:absolute",
                    "data-[active=true]:after:bottom-0",
                    "data-[active=true]:after:left-0",
                    "data-[active=true]:after:right-0",
                    "data-[active=true]:after:h-[2px]",
                    "data-[active=true]:after:rounded-[2px]",
                    "data-[active=true]:after:bg-[#2a88a3]",
                    "navbar-size",
                ],
            }}
        >
            <NavbarBrand className="items-center flex-row gap-4">
                <Image src="https://res.cloudinary.com/dl8zstpix/image/upload/v1741056418/kontask_logo_hsxljn.png" alt="KonTask" width="auto" height={40} />
                <Link href="/home" className="brand-text">KONTASK
                </Link>
            </NavbarBrand>
            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarItem className="w-32 flex justify-center" isActive={currentRoute === '/profile'}>
                    <Tooltip
                        content={
                            <div className="px-1 py-2">
                                <div className="text-md">Profile</div>
                            </div>
                        }
                        delay={0}
                        closeDelay={0}
                        offset={25}
                    >
                        <Link href="profile">
                            <ProfileIcon color='#2a88a3' />
                        </Link>
                    </Tooltip>
                </NavbarItem>
                <NavbarItem className="w-32 flex justify-center" isActive={currentRoute.includes('/home')}>
                    <Tooltip
                        content={
                            <div className="px-1 py-2">
                                <div className="text-md">Home</div>
                            </div>
                        }
                        delay={0}
                        closeDelay={0}
                        offset={25}
                    >
                        <Link href="home">
                            <HomeIcon color='#2a88a3' />
                        </Link>
                    </Tooltip>
                </NavbarItem>
                <NavbarItem className="w-32 flex justify-center" isActive={currentRoute === '/database'}>
                    <Tooltip
                        content={
                            <div className="px-1 py-2">
                                <div className="text-md">Database</div>
                            </div>
                        }
                        delay={0}
                        closeDelay={0}
                        offset={25}
                    >
                        <Link href="database">
                            <DatabaseIcon color='#2a88a3' />
                        </Link>
                    </Tooltip>
                </NavbarItem>
            </NavbarContent>
            <NavbarContent className="hidden sm:flex gap-8" justify="end">
                <NavbarItem>
                    <Tooltip
                        content={
                            <div className="px-1 py-2">
                                <div className="text-md">Add email</div>
                            </div>
                        }
                        delay={0}
                        closeDelay={0}
                        offset={25}
                    >
                        <Link href="/add_email">
                            <AddIcon />
                        </Link>
                    </Tooltip>
                </NavbarItem>
                <NavbarItem>
                    <Tooltip
                        content={
                            <div className="px-1 py-2">
                                <div className="text-md">Message</div>
                            </div>
                        }
                        delay={0}
                        closeDelay={0}
                        offset={25}
                    >
                        <Link href="#">
                            <MessageIcon color="#2a88a3" />
                        </Link>
                    </Tooltip>
                </NavbarItem>
                <NavbarItem>
                    <Tooltip
                        content={
                            <div className="px-1 py-2">
                                <div className="text-md">Notification</div>
                            </div>
                        }
                        delay={0}
                        closeDelay={0}
                        offset={25}
                    >
                        <Link href="#">
                            <NotificationIcon color="#2a88a3" />
                        </Link>
                    </Tooltip>
                </NavbarItem>
                <NavbarItem>
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Avatar
                                className="transition-transform"
                                style={{ boxShadow: '0 0 0 2px #2a88a3' }}
                                name="Jason Hughes"
                                size="md"
                                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                            />
                        </DropdownTrigger>
                        <DropdownMenu variant="flat">
                            <DropdownItem key="profile" className="h-14 gap-8" href="profile">
                                <p className="font-semibold" >Signed in as</p>
                                <p className="font-semibold">trongdatvuong@gmail.com</p>
                            </DropdownItem>
                            <DropdownItem key="settings">Settings</DropdownItem>
                            <DropdownItem key="logout" color="danger" onPress={handleLogOut}>
                                Log Out
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </NavbarItem>
            </NavbarContent>
        </Navbar>

    );
}