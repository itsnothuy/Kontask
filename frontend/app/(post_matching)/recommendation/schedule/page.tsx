'use client';

import { StarIcon } from "@/components/icons/star-icon";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter, Button, useDisclosure,
    CalendarDate, Avatar,
    Divider,
    Select, SelectItem
} from "@heroui/react";
import { useState, useCallback, useEffect } from "react";
import { Calendar } from "@heroui/react";
import { useRouter, usePathname } from "next/navigation"

export default function ScheduleModalPage() {
    const router = useRouter();
    const currentRoute = usePathname()
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [date, setDate] = useState<CalendarDate | null | undefined>();
    const [timeSlot, setTimeSlot] = useState();
    useEffect(() => {
        if (currentRoute === "/recommendation/schedule")
            onOpen();
    }, [currentRoute]);

    const timeSlots: string[] = [];
    const startTime = 10; // 10:00 AM
    const endTime = 17; // 5:00 PM

    for (let hour = startTime; hour < endTime; hour++) {
        timeSlots.push(`${hour}:00`);
        timeSlots.push(`${hour}:30`);
    }
    timeSlots.push(`${endTime}:00`); // Add the last slot at 5:00 PM

    interface FilterDateKey {
        key: string;
        title: string;
    }
    const filterDateKeys: FilterDateKey[] = [
        {
            key: "Today",
            title: "Today",
        },
        {
            key: "Within 3 Days",
            title: "Within 3 Days",
        },
        {
            key: "Within A Week",
            title: "Within A Week",
        },
        {
            key: "Choose Dates",
            title: "Choose Dates",
        },
    ];

    interface FilterTimeKey {
        key: string;
        title: string;
    }
    const filterTimeKeys: FilterTimeKey[] = [
        {
            key: "Morning",
            title: "Morning",
        },
        {
            key: "Afternoon",
            title: "Afternoon",
        },
        {
            key: "Evening",
            title: "Evening",
        },
    ];

    const tasker = {
        name: "Stephanie K.",
        avatarUrl: "https://i.pravatar.cc/150?u=stephaniek", // or any image URL
        rate: 60.91,
        minHours: 2,
        rating: 4.9,
        reviewCount: 63,
        tasksCount: 82,
        overallTasksCount: 80,
        description:
            "Experienced airbnb cleaner. I can bring all supplies or use yours prefer. Fast and efficient. Feel free to ask questions!",
        reviewAuthor: "Natalie O.",
        reviewDate: "Sat, Feb 8",
        reviewText:
            "Stephanie was available much sooner than other Taskers. Very punctual and brought her own supplies. Worked quickly and communicated when she was almost finished so I could review the work. Details like fridge/microwave, baseboards, and vents were careful...",
    };

    const handleContinue = useCallback(() => {
        router.replace("/confirm");
        onClose();
    }, []);

    const handleClose = useCallback(() => {
        router.replace("/recommendation");
        onClose();
    }, []);

    return (
        <Modal isDismissable={false} defaultOpen={true} isOpen={isOpen} onOpenChange={handleClose} size="2xl" className="flex flex-col h-auto">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Date and Start Time</ModalHeader>
                        <ModalBody className="flex flex-row gap-8 justify-between w-full">
                            <div className="w-1/2 flex flex-col gap-2">
                                <div className="flex flex-row gap-4">
                                    <Avatar
                                        radius="full"
                                        size="md"
                                        src="https://i.pravatar.cc/150?u=f0d115b0b717adbf2c4c"
                                    />
                                    <div className="flex flex-col items-start justify-center gap-1">
                                        <div className="text-small font-semibold leading-none text-default-600">Mike Johnson</div>
                                        <div className="text-small tracking-tight text-default-400">Available Time</div>
                                    </div>
                                </div>
                                <Calendar
                                    value={date} calendarWidth="full"
                                    onChange={(value: CalendarDate) => setDate(value)}
                                />
                                <Select variant="bordered" className="max-w-xs" label="Select Time" selectedKeys={timeSlot} onSelectionChange={(keys) => setTimeSlot(keys as any)}
                                >
                                    {timeSlots.map((timeSlot) => (
                                        <SelectItem key={timeSlot}>{timeSlot}</SelectItem>
                                    ))}
                                </Select>
                            </div>
                            <div key="divider" >
                                <Divider orientation="vertical" />
                            </div>
                            <div key="request" className="w-1/2 flex flex-col justify-center items-start h-auto gap-14">
                                <div className="flex flex-col items-start gap-2">
                                    <div className="text-xl font-semibold leading-none text-default-600">Request time:</div>
                                    <div className="text-md tracking-tight text-default-400">{date ? date.toString() : 'No date selected'}, {timeSlot ? timeSlot : 'No time selected'}</div>
                                </div>
                                <Button
                                    fullWidth
                                    className="plain-green-color text-white"
                                    variant="solid"
                                    onPress={handleContinue}
                                    isDisabled={!date || !timeSlot}
                                >
                                    Continue
                                </Button>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}