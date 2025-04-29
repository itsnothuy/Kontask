'use client';

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter, Button, useDisclosure,
    Avatar,
    Card,
    CardHeader,
    CardBody,
    Divider,
    ScrollShadow
} from "@heroui/react";
import { useState, useCallback, useEffect } from "react";
import { StarIcon } from "@/components/icons/star-icon";
import { useRouter, usePathname } from "next/navigation"


interface Params {
    post_id: string;
}

export default function PostDetailsPage({ params }: { params: Params }) {
    const router = useRouter();
    const currentRoute = usePathname()
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [bidStatus, setBidStatus] = useState<BidStatus>({});

    useEffect(() => {
        if (currentRoute === `/home/${params.post_id}`) {
            onOpen();
        }
    }, [currentRoute]);

    const suppliers = [
        {
            id: 1,
            name: "Tommy Shelby",
            avatarUrl: "https://i.pravatar.cc/150?u=supplier2",
            biddingPrice: "$17",
            serviceRequest: "Two-way ride to Walmart in my Toyota-Camry.",
        },
        {
            id: 2,
            name: "Andy Dufresne",
            avatarUrl: "https://i.pravatar.cc/150?u=supplier3",
            biddingPrice: "$20",
            serviceRequest: "I can offer you two-way ride to Walmart in my Honda-CRV.",
        },
    ];

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

    const handleContinue = useCallback(() => {
        router.replace("/confirm");
        onClose();
    }, []);

    const handleClose = useCallback(() => {
        router.replace("/home");
        onClose();
    }, []);

    return (
        <Modal isDismissable={false} defaultOpen={true} isOpen={isOpen} onOpenChange={handleClose} size="2xl" className="flex flex-col h-auto">
            <ModalContent className="flex flex-col h-auto">
                {(onClose) => (
                    <>
                        <ModalHeader className="px-4 flex gap-4">
                            <Avatar
                                radius="full"
                                size="md"
                                src="http://www.gravatar.com/avatar/?d=mp"
                            />
                            <div className="flex flex-col items-start gap-1">
                                <div className="text-small font-semibold leading-none text-default-600">Dat Vuong</div>
                                <div className="text-small tracking-tight text-default-400">Feb 28 at 8:54 AM</div>
                            </div>
                        </ModalHeader>
                        <ModalBody className="px-4 text-small text-default-600">
                            <p>Finding a reliable local driver to Walmart</p>
                            <Divider />
                            <div className="flex flex-row gap-3">
                                <div className="flex gap-1">
                                    <p className="font-semibold text-default-400 text-small">2</p>
                                    <p className=" text-default-400 text-small">Offers</p>
                                </div>
                                <div className="flex gap-1">
                                    <p className="font-semibold text-default-400 text-small">12</p>
                                    <p className="text-default-400 text-small">Views</p>
                                </div>
                            </div>
                            <Divider />
                        </ModalBody>
                        <ModalFooter className="p-2 gap-3">
                            <ScrollShadow hideScrollBar className="max-h-[200px] flex flex-col gap-4 overflow-auto w-full p-2">
                                {suppliers.map((supplier) => (
                                    <div className="flex flex-row gap-4 items-start">
                                        <Avatar src={supplier.avatarUrl} size="md" />
                                        <Card key={supplier.id} className="flex-1">
                                            <CardHeader className="flex flex-row items-start gap-4 p-2">
                                                <div className="flex flex-col flex-1">
                                                    <h3 className="text-sm font-semibold leading-none text-default-600">{supplier.name}</h3>
                                                    <p className="text-md text-green-600 font-bold">{supplier.biddingPrice}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        color="success"
                                                        size="sm"
                                                        onPress={() => handleDecision(supplier.id, "Accepted ✅")}
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        color="danger"
                                                        size="sm"
                                                        onPress={() => handleDecision(supplier.id, "Rejected ❌")}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <Divider />
                                            <CardBody className="flex flex-col gap-4">
                                                <p className="text-default-600 text-sm">{supplier.serviceRequest}</p>
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
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}