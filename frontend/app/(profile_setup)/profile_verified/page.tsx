'use client';

import { Textarea, Card, CardHeader, CardBody, Avatar, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Accordion, AccordionItem, Button, useDisclosure, Chip, CardFooter, User } from "@heroui/react";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { getUser } from "@/services/home";
import { StarIcon } from "@/components/icons/star-icon";
import { VerifyIcon } from "@/components/icons/verify-icon";

type ProfileProps = {
    full_name: string;
    email: string;
    avatar_url: string;
    rating?: number;
    reviews?: number;
};
interface ProfileVerifiedPageProps {
    onVerify: () => void;
    onSkip: () => void;
  }
  

export default function ProfileVerifiedPage({
    onVerify,
    onSkip,
  }: ProfileVerifiedPageProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    const handleContinue = useCallback(
        async () => {
            setIsProcessing(true);
            try {
                // Simulate saving post content
                await new Promise((resolve) => setTimeout(resolve, 1000));
                // Redirect to recommendation page
                onVerify();
            } catch (error) {
                console.error("Failed to save post content", error);
            } finally {
                setIsProcessing(false);
            }
        },
        [onVerify]
    );
    const handleSkip = useCallback(() => {
        // Immediately move to the next step (summary)
        onSkip();
      }, [onSkip]);
    
    const [profileInfo, setProfileInfo] = useState<ProfileProps>(
        {
            full_name: "Dat Trong Vuong",
            email: "trongdatvuong@gmail.com",
            avatar_url: "http://www.gravatar.com/avatar/?d=mp",
            rating: 4.5,
            reviews: 10,
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

    return (
        <div className="h-full flex-row flex gap-4 justify-center px-8">
            <div className="w-1/2 flex flex-col gap-4 p-8">
                {/* Post Content */}
                <Card className="flex flex-col h-auto">
                    <CardHeader className="px-4 items-center justify-center">
                        <div className="text-2xl text-default-800 font-bold">Verify your Identity</div>
                    </CardHeader>
                    <CardBody className="flex flex-col gap-4 justify-center p-4">
                        <div className="flex gap-4 items-center">
                            <Avatar className="w-20 h-20" src={profileInfo.avatar_url} name={profileInfo.full_name} />
                            <div className="flex flex-col gap-1">
                                <h2 className="text-xl font-bold leading-tight">{profileInfo.full_name}</h2>
                                <div className="flex items-center gap-1">
                                    {/* Hard-coded star icons, or map them dynamically */}
                                    {[...Array(5)].map((_, idx) => (
                                        <StarIcon
                                            key={idx}
                                            height={18}
                                            width={18}
                                            color={idx < Math.round(profileInfo.rating ?? 0) ? "#2a88a3" : "#E5E7EB"}
                                        />
                                    ))}
                                    <span className="text-sm text-default-600">
                                        {profileInfo.rating}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <VerifyIcon height={18} width={18} color="#2a88a3" />
                                    <h2 className="text-sm text-default-600 kontask-text-color font-semibold">KonTask Verified</h2>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-md">To ensure the safety of our community, we need to verify your identity before you can start posting tasks. We will ask for:</p>
                            <ul className="text-sm px-6 ">
                                <li className="list-disc">A photo of your ID</li>
                                <li className="list-disc">A selfie</li>
                                <li className="list-disc">SSN, DOB, and your permanent address</li>
                                <li className="list-disc">One time fee to process your background check</li>
                            </ul>
                        </div>

                    </CardBody>

                    <CardFooter className="flex flex-row gap-4">
                        <Button
                            onPress={handleSkip}
                            fullWidth isLoading={isProcessing} className="plain-green-color text-white" >
                            Verify me now
                        </Button>
                        <Button
                            color="default"
                            onPress={handleSkip}
                            fullWidth isLoading={isProcessing} >
                            Skip for now
                        </Button>
                    </CardFooter>
                </Card>

            </div>
        </div >
    );
}