'use client';

import { Textarea, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@heroui/react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";


export const CreatePostModal = (isOpen: boolean, onOpenChange: VoidFunction, onClose: () => void) => {
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
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="dark" size="5xl" scrollBehavior="inside">
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <Input
                                className="w-full h-full"
                                value={postTitle}
                                onValueChange={setPostTitle}
                                variant="underlined"
                            />
                        </ModalHeader>
                        <ModalBody className="flex flex-col">
                            <Textarea
                                variant="bordered"
                                className="w-full h-full"
                                value={postContent}
                                maxRows={30}
                                onValueChange={setPostContent}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button isLoading={isProcessing} color="primary" onPress={handleSave}>
                                Save
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}