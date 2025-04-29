"use client";

import React, { useState, useCallback } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Progress,
    Avatar,
    Badge,
    useDisclosure,
    Textarea, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Divider,
    ScrollShadow
} from "@heroui/react";
import { toast } from "react-hot-toast";
import { PostGrid } from "@/components/post_grid";
import { AddIcon } from "@/components/icons/add-icon";
import { TrashIcon, StarIcon } from "@/components/icons/page";
import { CreatePostModal } from "@/components/create_post_modal";
import { useRouter } from "next/navigation";

export default function Post() {


    const post = {
        avatarUrl: "https://i.pravatar.cc/150?u=supplier1",
        title: "Looking for a Cleaning Service",
        name: "Jason Hughes",
        description: "Need a deep cleaning service for my apartment, including carpets and kitchen cleaning. Looking for a professional and reliable supplier who can complete the job within a week.",
    };

    const suppliers = [
        {
            id: 1,
            name: "Elite Affordable Movers & Cleaning",
            avatarUrl: "https://i.pravatar.cc/150?u=supplier1",
            biddingPrice: "$199",
            serviceRequest: "Includes carpet and kitchen cleaning.",
        },
        {
            id: 2,
            name: "Sparkle Clean Services",
            avatarUrl: "https://i.pravatar.cc/150?u=supplier2",
            biddingPrice: "$180",
            serviceRequest: "Eco-friendly products, one-day service.",
        },
        {
            id: 3,
            name: "Pro Clean Experts",
            avatarUrl: "https://i.pravatar.cc/150?u=supplier3",
            biddingPrice: "$220",
            serviceRequest: "Deep cleaning plus balcony and window washing.",
        },
    ];
    const [bidStatus, setBidStatus] = useState<BidStatus>({});

    interface Supplier {
        id: number;
        name: string;
        avatarUrl: string;
        biddingPrice: string;
        serviceRequest: string;
    }

    interface Post {
        title: string;
        description: string;
    }

    interface BidStatus {
        [key: number]: string;
    }

    const handleDecision = (id: number, decision: string): void => {
        setBidStatus((prevStatus: BidStatus) => ({
            ...prevStatus,
            [id]: decision,
        }));
    };

    // Mock data for demonstration
    const createPostModal = useDisclosure();
    const postDetailModal = useDisclosure();
    const router = useRouter();

    const [isProcessing, setIsProcessing] = useState(false);
    const [postTitle, setPostTitle] = useState("");
    const [postContent, setPostContent] = useState("");
    const handleSave = useCallback(
        async () => {
            setIsProcessing(true);
            const postData = {}
            if (postData) {
                console.log("Email saved successfully");
                toast.success("Email saved successfully");
                router.replace("/database");
            } else {
                console.error("Error saving email");
                toast.error("Error saving email");
            }
            setIsProcessing(false);

        },
        [postTitle, postContent]
    );
    const [stats] = useState([
        { label: "In Progress", value: 45 },
        { label: "Upcoming", value: 24 },
        { label: "Total Projects", value: 62 },
    ]);

    const handleCreatePost = useCallback(() => {
        createPostModal.onOpen();

    }, [createPostModal]);

    const handlePostDetailModal = useCallback(() => {
        postDetailModal.onOpen();

    }, [postDetailModal]);

    const [posts] = useState([
        {
            id: "1",
            date: "December 10, 2020",
            title: "Web Designing",
            subtitle: "Prototyping",
            status: "Pending",
            description: "Creating wireframes and mockups for the new website.",
            color: "bg-[#E7F0FF]"
        },
        {
            id: "2",
            date: "December 11, 2020",
            title: "Backend Development",
            subtitle: "API Integration",
            status: "Accepted",
            description: "Integrating third-party APIs for the application.",
            color: "bg-[#FFF4E6]"
        },
        {
            id: "3",
            date: "December 12, 2020",
            title: "Database Design",
            subtitle: "Schema Creation",
            status: "Pending",
            description: "Designing the database schema for the project.",
            color: "bg-[#E9F7EF]"
        },
        {
            id: "4",
            date: "December 13, 2020",
            title: "Testing",
            subtitle: "Unit Testing",
            status: "Accepted",
            description: "Writing unit tests for the application.",
            color: "bg-[#FEEEEF]"
        },
        {
            id: "5",
            date: "December 14, 2020",
            title: "Deployment",
            subtitle: "Production Deployment",
            status: "Accepted",
            description: "Deploying the application to the production environment.",
            color: "bg-[#E7F0FF]"
        },
    ]);

    const [messages] = useState([
        {
            id: 1,
            name: "Stephanie",
            message: "I've got the first assignment. It's neat, good job!",
        },
        {
            id: 2,
            name: "Mark",
            message: "Any new updates on the next round of projects?",
        },
        {
            id: 3,
            name: "David",
            message: "Hey, I'd love to jump on a call this afternoon.",
        },
        {
            id: 4,
            name: "Lisa",
            message: "I am really impressed! Can't wait to see the final.",
        },
    ]);

    return (
        <div className="flex flex-row gap-4 justify-center px-8 pb-8 w-full h-full text-white">

            {/*
        Left side (main content)
      */}
            <Card className="w-full flex flex-col gap-4 p-8">
                {/* Top row: Title, date, or any navigation */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Posts</h1>
                    <div className="flex items-center gap-2">
                        <Button size="md" color="primary"
                            onPress={() => handleCreatePost()}
                        >
                            Add Post</Button>
                    </div>
                </div>

                {/* Projects grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {posts.map((post) => (
                        <PostGrid key={post.id} post={post} onPress={handlePostDetailModal} />
                    ))}
                </div>
            </Card>
            <Modal isOpen={createPostModal.isOpen} onOpenChange={createPostModal.onOpenChange} size="2xl" scrollBehavior="inside">
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h1 className="text-xl font-bold flex items-center justify-center w-full">
                                    Create post
                                </h1>
                                <Divider />
                            </ModalHeader>
                            <ModalBody className="w-full h-64">
                                <Textarea
                                    placeholder="Enter your post content"
                                    variant="underlined"
                                    value={postContent}
                                    className="w-full h-full"
                                    size="lg"
                                    minRows={10}
                                    maxRows={10}
                                    onValueChange={setPostContent}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button className="w-full" isLoading={isProcessing} color="primary" onPress={handleSave}>
                                    Post
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <Modal isOpen={postDetailModal.isOpen} onOpenChange={postDetailModal.onOpenChange}>
                <ModalContent className="w-full max-w-2xl">
                    <ModalHeader className="flex flex-row items-center gap-4">
                        <Avatar src={post.avatarUrl} size="lg" />
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold">{post.title}</h2>
                            <p className="text-sm text-gray-600">{post.description}</p>
                        </div>
                    </ModalHeader>
                    <Divider />

                    {/* Suppliers List (Scrollable) */}
                    <ModalBody  >
                        <ScrollShadow hideScrollBar className="max-h-[200px] overflow-auto w-full">
                            {suppliers.map((supplier) => (
                                <div className="flex flex-row gap-4 m-2 items-start">
                                    <Avatar src={supplier.avatarUrl} size="md" />

                                    <Card key={supplier.id} className="flex-1">
                                        <CardHeader className="flex flex-row items-start gap-4 p-2">
                                            <div className="flex flex-col flex-1">
                                                <h3 className="text-md font-semibold">{supplier.name}</h3>
                                                <p className="text-green-600 font-bold">{supplier.biddingPrice}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    color="success"
                                                    size="sm"
                                                    startContent={<StarIcon />}
                                                    onPress={() => handleDecision(supplier.id, "Accepted ✅")}
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    startContent={<StarIcon />}
                                                    onPress={() => handleDecision(supplier.id, "Rejected ❌")}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <Divider />
                                        <CardBody className="flex flex-col gap-4">
                                            <p className="text-gray-700 text-sm">{supplier.serviceRequest}</p>
                                            {bidStatus[supplier.id] && (
                                                <div className="mt-2 p-2 bg-gray-100 rounded-md text-center text-sm font-semibold">
                                                    {bidStatus[supplier.id]}
                                                </div>
                                            )}
                                        </CardBody>
                                    </Card>
                                </div>
                            ))}
                        </ScrollShadow>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div >
    );
}