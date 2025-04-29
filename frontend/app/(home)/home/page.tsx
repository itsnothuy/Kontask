'use client';

import { Link, Listbox, ListboxItem, Input, Card, CardHeader, CardBody, Avatar, Divider, Accordion, AccordionItem, Button, useDisclosure, Chip, CardFooter, User } from "@heroui/react";
import { EditIcon, WrenchIcon, PaintIcon, ThreeDotVerticleIcon, ClockIcon, StickIcon, ImageIcon, VideoIcon, AIIdeaIcon, WarningIcon } from "@/components/icons/page";
import { useState, useCallback, useEffect } from "react";

import { CarIcon } from "@/components/icons/car-icon";
import { useRouter } from 'next/navigation';
import { PostFeed } from "@/components/post_feed";
import { getPostsByUserID, getUser } from "@/services/home";
import { profile } from "console";

type ProfileProps = {
    full_name: string;
    email: string;
    avatar_url: string;
};

const initialSkills = ["C++", "React", "NextJS", "mongoDB"];

export default function HomePage() {
    const router = useRouter();

    const handleCreatePost = useCallback(
        async () => {
            try {
                // Simulate saving post content
                await new Promise((resolve) => setTimeout(resolve, 1000));
                // Redirect to recommendation page
                router.replace('create_post');
            } catch (error) {
                console.error("Failed to save post content", error);
            } finally {
            }
        },
        []
    );
    const [profileInfo, setProfileInfo] = useState<ProfileProps>(
        {
            full_name: "Dat Trong Vuong",
            email: "trongdatvuong@gmail.com",
            avatar_url: "http://www.gravatar.com/avatar/?d=mp",
        }
    );

    const queryPost = async () => {
        const data = await getPostsByUserID();
        console.log(data);
        // Query the matching supplier based on the selectedDateKey and selectedTimeKeys
    };

    const queryUser = async () => {
        const user = await getUser();
        if (user.data.detail === undefined) {
            setProfileInfo(
                {
                    full_name: user.data?.full_name,
                    email: user.data?.email,
                    avatar_url: user.data?.avatar_url,
                }
            );
        }

        // Query the matching supplier based on the selectedDateKey and selectedTimeKeys
    };
    useEffect(() => {
        queryPost();
        queryUser();
    }
        , []);


    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    interface Service {
        id: number;
        name: string;
        items: { title: string; href: string }[];
        icon: JSX.Element;
    }
    const recommendedServices: Service[] = [
        {
            id: 1,
            name: "Assembly",
            items: [{ title: "IKEA Assembly", href: "#" }, { title: "Pax Assembly", href: "#" }],
            icon: <WrenchIcon height={24} width={24} />,
        },
        {
            id: 2,
            name: "Paint",
            items: [
                { title: "Interior Painting", href: "#" },
                { title: "Exterior Painting", href: "#" },
                { title: "Wall Painting", href: "#" }
            ],
            icon: <PaintIcon height={24} width={24} />,
        },
        {
            id: 3,
            name: "Ride",
            items: [
                { title: "Airport", href: "#" },
                { title: "Walmart", href: "walmart_create_post" },
                { title: "Kroger", href: "#" }
            ],
            icon: <CarIcon height={24} width={24} />,
        },
    ];

    interface FilterKey {
        key: string;
        title: string;
        color: 'warning' | 'danger' | 'default' | 'primary' | 'secondary' | 'success';
        // Removed icon property from FilterKey type
        icon: JSX.Element;
    }
    const filterKeys: FilterKey[] = [
        {
            key: "Accepted",
            title: "Accepted",
            color: "success",
            icon: <StickIcon height={20} width={20} color="#69CE73" />
        },
        {
            key: "Pending",
            title: "Pending",
            color: 'warning',
            icon: <ClockIcon height={20} width={20} color="#F5A571" />
        },
        {
            key: "Expired",
            title: "Expired",
            color: 'danger',
            icon: <WarningIcon height={20} width={20} color="#F31260" />
        },
    ]
    return (
        <div className="h-full flex-row flex gap-4 justify-center px-8">
            {/* Left side - Suggestion and Filter */}
            <div className="w-1/6 flex flex-col gap-4">
                <Card className=" px-8 py-16 flex-col justify-center items-center gradient-button ">
                    <div className="pb-4">
                        <Avatar
                            className="w-30 h-30"
                            name={profileInfo?.full_name}
                            src={profileInfo?.avatar_url}
                        />
                    </div>
                    <p className="font-bold text-xl">{profileInfo?.full_name}</p>
                </Card>
                <Card className="flex-col justify-center">
                    <CardHeader className="px-4 flex-row justify-between" >
                        <p className="text-lg feed-title-text">Suggestion</p>
                        <ThreeDotVerticleIcon height={20} width={20} />
                    </CardHeader>
                    <Divider />
                    <CardBody className="p-0 h-auto">
                        <Accordion className="m-0 p-0 h-auto" showDivider={false} variant="light">
                            {recommendedServices.map((service) => (
                                <AccordionItem className="pl-4 pr-5 py-0 m-0 text-md" key={service.id} startContent={service.icon} title={<span className="p-0 m-0 text-sm text-default-600">{service.name}</span>}>
                                    {service.items.map((item) => (
                                        <Button as={Link} href={item.href} key={item.title} variant="bordered" radius="full" className="text-sm m-1">{item.title}</Button>
                                    ))}
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardBody>
                </Card>
                <Card className="flex-col justify-center h-auto">
                    <CardHeader className="px-4 flex-row justify-between" >
                        <p className="text-lg feed-title-text">Filter</p>
                        <ThreeDotVerticleIcon height={20} width={20} />
                    </CardHeader>
                    <Divider />
                    <CardBody className="w-full p-0">
                        <Listbox
                            className="w-full p-0 m-0"
                            aria-label="Multiple selection example"
                            selectedKeys={selectedKeys}
                            selectionMode="multiple"
                            variant="flat"
                            onSelectionChange={(keys) => setSelectedKeys(new Set(keys as unknown as string[]))}>
                            {filterKeys.map((filter) => (
                                <ListboxItem startContent={filter.icon} className="pl-4 pr-5 py-3 text-md" key={filter.key} color={filter.color}>
                                    <span className={`text-md text-default-600`}>{filter.title}</span>
                                </ListboxItem>
                            ))}
                        </Listbox>
                    </CardBody>
                </Card>
            </div>
            {/* Middle side - Post and Feed Content */}
            <div className="w-1/2 flex flex-col gap-4">
                <Card className="flex-col justify-center">
                    <CardBody className="px-4 flex flex-row gap-4">
                        <Avatar
                            radius="full"
                            size="md"
                            src={profileInfo?.avatar_url}
                        />
                        <Button onPress={handleCreatePost} className="h-full justify-start text-default-400" radius="full" variant="bordered" fullWidth aria-label="Edit" size='lg'>
                            Start a Post
                        </Button>
                    </CardBody>
                    <Divider />
                    <CardFooter className="flex-row justify-between px-20 py-2 m-0">
                        <Button className="p-1 m-0" variant="light" color="primary" aria-label="Edit" size='lg'>
                            <ImageIcon height={20} width={20} color='#378FE9' />
                            Photo
                        </Button>
                        <Button className="p-1 m-0" variant="light" color="success" aria-label="Edit" size='lg'>
                            <VideoIcon height={20} width={20} color='#5F9B41' />
                            Video
                        </Button>
                        <Button className="p-1 m-0" variant="light" color="warning" aria-label="Edit" size='lg'>
                            <AIIdeaIcon height={20} width={20} color='#E06847' />
                            AI Generation
                        </Button>
                    </CardFooter>
                </Card>
                {/* Post Content */}
                <PostFeed post={
                    {
                        id: "1",
                        user: {
                            name: profileInfo.full_name,
                            avatarUrl: profileInfo.avatar_url,
                        },
                        date: "Feb 28 at 8:54 AM",
                        status: "Active",
                        description: "Finding a reliable local driver to Walmart",
                        offers: 2,
                        views: 12,
                    }
                } />
                <PostFeed post={
                    {
                        id: "2",
                        user: {
                            name: profileInfo.full_name,
                            avatarUrl: profileInfo.avatar_url,
                        },
                        date: "Feb 27 at 4:54 PM",
                        status: "Active",
                        description: "I need my nails done for a wedding",
                        offers: 3,
                        views: 20,
                    }
                } />
                <PostFeed post={
                    {
                        id: "3",
                        user: {
                            name: profileInfo.full_name,
                            avatarUrl: profileInfo.avatar_url,
                        },
                        date: "Feb 26 at 2:12 PM",
                        status: "Active",
                        description: "Find a software engineer for startup idea.",
                        offers: 6,
                        views: 8,
                    }
                } />

            </div>
            {/* Right side - Message and Contact */}
            <div className="w-1/5 flex flex-col gap-4">
                <Card className="flex-col justify-center h-auto">
                    <CardHeader className="px-4 flex-row justify-between" >
                        <p className="text-lg feed-title-text">Contact</p>
                        <ThreeDotVerticleIcon height={20} width={20} />
                    </CardHeader>
                    <Divider />
                    <CardBody className="flex flex-col w-full p-0">
                        <Button className="justify-start px-4 py-8 text-default-600" variant="light">
                            <User
                                avatarProps={{
                                    src: "https://avatars.githubusercontent.com/u/30373425?v=4",
                                }}
                                name="Junior Garcia"
                            />
                        </Button>
                        <Button className="justify-start px-4 py-8 text-default-600" variant="light">
                            <User
                                avatarProps={{
                                    src: "https://avatars.githubusercontent.com/u/30373425?v=4",
                                }}
                                name="Junior Garcia"
                            />
                        </Button>
                        <Button className="justify-start px-4 py-8 text-default-600" variant="light">
                            <User
                                avatarProps={{
                                    src: "https://avatars.githubusercontent.com/u/30373425?v=4",
                                }}
                                name="Junior Garcia"
                            />
                        </Button>
                        <Button className="justify-start px-4 py-8 text-default-600" variant="light">
                            <User
                                avatarProps={{
                                    src: "https://avatars.githubusercontent.com/u/30373425?v=4",
                                }}
                                name="Junior Garcia"
                            />
                        </Button>
                        <Button className="justify-start px-4 py-8 text-default-600" variant="light">
                            <User
                                avatarProps={{
                                    src: "https://avatars.githubusercontent.com/u/30373425?v=4",
                                }}
                                name="Junior Garcia"
                            />
                        </Button>
                        <Button className="justify-start px-4 py-8 text-default-600" variant="light">
                            <User
                                avatarProps={{
                                    src: "https://avatars.githubusercontent.com/u/30373425?v=4",
                                }}
                                name="Junior Garcia"
                            />
                        </Button>
                        <Button className="justify-start px-4 py-8 text-default-600" variant="light">
                            <User
                                avatarProps={{
                                    src: "https://avatars.githubusercontent.com/u/30373425?v=4",
                                }}
                                name="Junior Garcia"
                            />
                        </Button>
                    </CardBody>
                </Card>
            </div>
        </div >
    );
}