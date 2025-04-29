'use client';

import React, { useCallback } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Avatar } from '@heroui/react';
import { useRouter } from 'next/navigation';

interface User {
    name: string;
    avatarUrl: string;
}

interface Post {
    id: string;
    user: User;
    date: string;
    status?: string;
    description: string;
    offers?: number;
    views?: number;
}

export const PostFeed = ({ post }: { post: Post }) => {
    const router = useRouter();

    const handleOnPressPost = useCallback(
        async () => {
            try {
                // Redirect to recommendation page]
                console.log()
                router.replace(`/home/${post.id}`);
            } catch (error) {
                console.error("Failed to open post content", error);
            } finally {
            }
        },
        []
    );

    return (
        <Card isPressable className="flex flex-col h-auto" onPress={handleOnPressPost}>
            <CardHeader className="px-4 flex gap-4">
                <Avatar
                    radius="full"
                    size="md"
                    src={post.user.avatarUrl}
                />
                <div className="flex flex-col items-start gap-1">
                    <div className="text-small font-semibold leading-none text-default-600">{post.user.name}</div>
                    <div className="text-small tracking-tight text-default-400">{post.date}</div>
                </div>
            </CardHeader>
            <CardBody className="px-4 text-small text-default-600">
                <p>{post.description}</p>
            </CardBody>
            <CardFooter className="px-4 gap-3">
                <div className="flex gap-1">
                    <p className="font-semibold text-default-400 text-small">{post.offers ?? 0}</p>
                    <p className=" text-default-400 text-small">Offers</p>
                </div>
                <div className="flex gap-1">
                    <p className="font-semibold text-default-400 text-small">{post.views ?? 0}</p>
                    <p className="text-default-400 text-small">Views</p>
                </div>
            </CardFooter>
        </Card>
    );
}