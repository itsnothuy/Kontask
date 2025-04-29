'use client';

import { Textarea, Card, CardHeader, CardBody, Avatar, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Accordion, AccordionItem, Button, useDisclosure, Chip, CardFooter, User } from "@heroui/react";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { usePostMatchingContext } from "../layout";
import { getUser } from "@/services/home";

type ProfileProps = {
    full_name: string;
    email: string;
    avatar_url: string;
};

export default function CreatePostPage() {
    const postMatchingContext = usePostMatchingContext();
    if (!postMatchingContext) {
        return <div>Error: PostMatchingContext is null</div>;
    }
    const { content, setContent } = postMatchingContext;

    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    const handleContinue = useCallback(
        async () => {
            setIsProcessing(true);
            try {
                // Simulate saving post content
                await new Promise((resolve) => setTimeout(resolve, 1000));
                // Redirect to recommendation page
                router.replace('recommendation');
            } catch (error) {
                console.error("Failed to save post content", error);
            } finally {
                setIsProcessing(false);
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
        queryUser();
    }
        , []);

    return (
        <div className="h-full flex-row flex gap-4 justify-center px-8">
            <div className="w-1/2 flex flex-col gap-4 p-8">
                {/* Post Content */}
                <Card className="flex flex-col h-auto">
                    <CardHeader className="px-4 flex gap-4">
                        <Avatar
                            radius="full"
                            size="md"
                            src={profileInfo.avatar_url}
                        />
                        <div className="flex flex-col items-start gap-1">
                            <div className="text-small font-semibold leading-none text-default-600">{profileInfo.full_name}</div>
                            <div className="text-small tracking-tight text-default-400"> {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</div>
                        </div>
                    </CardHeader>
                    <CardBody className="px-4 text-small text-default-400">
                        <Textarea
                            placeholder="Write your post"
                            variant="underlined"
                            value={content}
                            className="w-full h-full text-default-600"
                            size="lg"
                            minRows={10}
                            maxRows={10}
                            onValueChange={setContent}
                        />
                    </CardBody>
                    <CardFooter >
                        <Button
                            onPress={handleContinue}
                            fullWidth isLoading={isProcessing} className="plain-green-color text-white" >
                            Continue
                        </Button>
                    </CardFooter>
                </Card>

            </div>

        </div >
    );
}