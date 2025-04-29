'use client';

import { Select, SelectItem, Textarea, Card, CardHeader, CardBody, Avatar, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Accordion, AccordionItem, Button, useDisclosure, Chip, CardFooter, User, TimeInput } from "@heroui/react";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { usePostMatchingContext } from "../../layout";
import { getUser } from "@/services/home";

type ProfileProps = {
    full_name: string;
    email: string;
    avatar_url: string;
};

type WalmartStore = {
    name: string;
    address: string;
};


export default function WalmartCreatePostPage() {
    const postMatchingContext = usePostMatchingContext();

    const walmartStores: WalmartStore[] = [
        {
            name: "Walmart Garden Center",
            address: "1750 Indianapolis Rd, Greencastle, IN 46135"
        },
        {
            name: "Walmart",
            address: "2150 E National Ave, Brazil, IN 47834"
        },
        {
            name: "Walmart Supercenter",
            address: "9500 E US Hwy 36, Avon, IN 46123"
        }
    ];

    const [selectedWalmart, setSelectedWalmart] = useState<WalmartStore>(walmartStores[0]);

    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");

    if (!postMatchingContext) {
        return <div>Error: PostMatchingContext is null</div>;
    }
    const { content, setContent } = postMatchingContext;

    useEffect(() => {
        setContent(`I need a ride to ${selectedWalmart.name} at ${selectedWalmart.address}. Could someone help me?`);
    }, [selectedWalmart]);

    
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();


    const handleSelectedWalmart = (event: any) => {
        const selectedStore = walmartStores.find(store => store.name === event.target.value);
        if (selectedStore) {
            setSelectedWalmart(selectedStore);
        }
    };

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
                <Select
                    className="w-full"
                    classNames={{
                        label: "group-data-[filled=true]:-translate-y-4",
                    }}
                    label={<div>📌 Location</div>}
                    placeholder="Select Walmart Store"
                    selectedKeys={[selectedWalmart.name]}
                    variant="bordered"
                    onChange={handleSelectedWalmart}
                    items={walmartStores}
                    renderValue={(items) => {
                        return items.map((item) => (
                            <div className="flex flex-col">
                                <span className="text-small">{item.data?.name}</span>
                                <span className="text-tiny text-default-400">{item.data?.address}</span>
                            </div>
                        ));
                    }}
                >
                    {(walmart) => (
                        <SelectItem key={walmart.name} textValue={walmart.name}>
                            <div className="flex flex-col">
                                <span className="text-small">{walmart.name}</span>
                                <span className="text-tiny text-default-400">{walmart.address}</span>
                            </div>
                        </SelectItem>
                    )}
                </Select>
                <div className="flex flex-row gap-4">
                    <TimeInput
                        label="Availability Start Time"
                        variant="bordered"
                        className="w-1/2"
                    >
                    </TimeInput>
                    <TimeInput
                        label="Availability End Time"
                        variant="bordered"
                        className="w-1/2"
                    >
                    </TimeInput>
                </div>
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