'use client';

import React from 'react';
import { Card, CardHeader, CardBody, Progress, Chip } from '@heroui/react';

interface Post {
    id: string;
    color: string;
    date: string;
    title: string;
    subtitle: string;
    status: string;
    description: string;
}

export const PostGrid = ({ post, onPress }: { post: Post, onPress: () => void }) => {
    return (
        <Card
            key={post.id}
            isPressable
            isHoverable
            onPress={onPress}
            className={`p-4 dark:bg-[#1F2937] dark:border-none ${post.color}`}
        >
            <CardHeader className="flex flex-col gap-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                    {post.date}
                </span>
                <span className="text-md font-bold text-black dark:text-white">
                    {post.title}
                </span>
                {/* <span className="text-xs text-black/70 dark:text-white/70">
                    {post.subtitle}
                </span> */}
                <Chip radius='sm' color={post.status == "Pending" ? "danger" : "success"} size="sm">
                    {post.status}
                </Chip>
            </CardHeader>
            <CardBody className="flex flex-col space-y-2">
                {post.description}
            </CardBody>
        </Card>
    );
}