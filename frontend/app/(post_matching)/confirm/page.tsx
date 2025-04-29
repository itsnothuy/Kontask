'use client';

import { StarIcon } from "@/components/icons/star-icon";
import { Listbox, ListboxItem, Card, CardHeader, CardBody, Select, SelectItem, Avatar, Divider, Button, CardFooter, Slider, RadioGroup, Radio, Input, Textarea } from "@heroui/react";
import { useState, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { CalendarIcon } from "@/components/icons/calendar-icon";
import { LocationIcon } from "@/components/icons/location-icon";
import { usePostMatchingContext } from "../layout";


export default function ConfirmPage() {
    const router = useRouter();
    const [selectedFrequency, setSelectedFrequency] = useState<string>("Just Once");
    const [isProcessing, setIsProcessing] = useState(false);
    const postMatchingContext = usePostMatchingContext();

    if (!postMatchingContext) {
        return <div>Error: PostMatchingContext is null</div>;
    }

    const { content } = postMatchingContext;

    interface FrequencyKey {
        key: string;
        title: string;
        description?: string;
    }

    const frequencyKeys: FrequencyKey[] = [
        {
            key: "Just Once",
            title: "Just Once",
        },
        {
            key: "Weekly",
            title: "Weekly",
            description: "Save 15%",
        },
        {
            key: "Bi-Weekly",
            title: "Bi-Weekly",
            description: "Save 10% - MOST POPULAR",
        },
        {
            key: "Monthly",
            title: "Monthly",
            description: "Save 5% ",
        },
    ];

    return (
        <div className="h-full flex-row flex gap-4 justify-center px-8">
            {/* Confirm Details - Post and Feed Content */}
            <div className="w-1/2 flex flex-col gap-4">
                <Card className="w-full">
                    {/* Header: Confirm details title */}
                    <CardHeader className="flex gap-4 items-center">
                        <div>
                            <h2 className="text-2xl font-bold leading-tight">Confirm details</h2>
                        </div>
                    </CardHeader>

                    {/* Body: Frequency and Payment Method */}
                    <CardBody className="flex flex-col gap-4">
                        {/* Frequency */}
                        <div className="flex flex-col gap-2">
                            <p className="font-bold text-lg text-default-600">Select your frequency</p>
                            <RadioGroup color="default" defaultValue={selectedFrequency} onValueChange={setSelectedFrequency} >
                                {frequencyKeys.map((frequency) => (
                                    <Radio key={frequency.key} value={frequency.key} description={frequency.description}>{frequency.title}
                                        {/* <div className="flex flex-col gap-1">
                                            <p className="font-bold text-md">{frequency.title}</p>
                                            <p className="text-sm text-default-500">{frequency.description}</p>
                                        </div> */}
                                    </Radio>
                                ))}
                            </RadioGroup>
                        </div>
                        <Divider />
                        {/* Payment Method */}
                        <div className="flex flex-col gap-2">
                            <p className="font-bold text-lg text-default-600">Payment Method</p>
                            <Input
                                placeholder="1234 1234 1234 1234"
                                label="Card Number"
                                variant="underlined"
                                className="w-full"
                                size="md"
                            />
                            <div className="flex flex-row gap-2">
                                <Input
                                    label="Expiration date"
                                    placeholder="MM/YY"
                                    variant="underlined"
                                    className="w-1/2"
                                    size="md"
                                />
                                <Input
                                    label="Security code"
                                    placeholder="CVV"
                                    variant="underlined"
                                    className="w-1/2 text-default-600"
                                    size="md"
                                />

                            </div>
                            <div className="flex flex-row gap-2">
                                <Select className="w-1/2 text-default-600"
                                    label="Country"
                                    placeholder="Select country"
                                    variant="underlined"
                                >
                                    <SelectItem key="US">United States</SelectItem>
                                    <SelectItem key="UK">United Kingdom</SelectItem>
                                    <SelectItem key="VN">Vietnam</SelectItem>
                                </Select>
                                <Input
                                    label="ZIP code"
                                    placeholder="12345"
                                    variant="underlined"
                                    className="w-1/2 text-default-600"
                                    size="md"
                                />

                            </div>
                            <Input
                                placeholder="408 S Locust St, etc."
                                label="Address"
                                variant="underlined"
                                className="w-full"
                                size="md"
                            />

                        </div>
                    </CardBody>
                </Card>
            </div>
            {/* Right side - Summary and Payment */}
            <div className="w-1/5 flex flex-col gap-4">
                <Card className="flex-col justify-center">
                    <CardHeader className="p-4 gap-4 flex flex-col justify-center" >
                        <Avatar
                            radius="full"
                            size="lg"
                            src="https://i.pravatar.cc/150?u=f0d115b0b717adbf2c4c"
                        />
                        <div className="text-lg font-semibold leading-none text-default-600">Mike Johnson</div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="p-4 h-auto w-full flex">
                        <div className="py-4 flex flex-col gap-4 justify-center items-start">
                            <div className="flex flex-row gap-2 justify-center items-center">
                                <CalendarIcon width={20} height={20} />
                                <div className="text-sm font-semibold leading-none text-default-600">Wed, Mar 05 at 02:30 PM</div>
                            </div>
                            <div className="flex flex-row gap-2 justify-center items-center">
                                <LocationIcon width={20} height={20} />
                                <div className="flex flex-col gap-1">
                                    <div className="text-sm font-semibold leading-none text-default-600">408 S Locust St</div>
                                    <div className="text-sm font-semibold leading-none text-default-600">Greencastle, IN, 46135</div>
                                </div>
                            </div>
                        </div>
                        <Divider />
                        <div className="py-4 flex flex flex-col gap-4 justify-center items-start">
                            <div className="text-sm font-semibold leading-none text-default-600">Post details</div>
                            <Textarea
                                isReadOnly
                                fullWidth
                                placeholder="Enter your description"
                                value={content}
                                variant="bordered"
                            />
                        </div>
                        <Divider />
                        <div className="py-4 flex flex flex-col gap-4 justify-center items-start">
                            <div className="font-bold text-lg text-default-600">Price Details</div>
                            <div className="flex flex-row justify-between items-center w-full">
                                <div className="text-sm text-default-600">Hourly Rate</div>
                                <div className="text-sm text-default-600">$36.13/hr</div>
                            </div>
                            <div className="flex flex-row justify-between items-center w-full">
                                <div className="text-sm text-default-600">Trust and Support Fee</div>
                                <div className="text-sm text-default-600">$13.30/hr</div>
                            </div>
                            <div className="flex flex-row justify-between items-center w-full">
                                <div className="text-sm text-default-600">Total Rate</div>
                                <div className="text-sm font-bold text-default-600">$49.43/hr</div>
                            </div>
                        </div>
                    </CardBody>
                    <CardFooter className="flex flex-row gap-4 p-4">

                        <Button
                            onPress={() => router.replace('/recommendation')}
                            fullWidth
                        >
                            Cancel
                        </Button>
                        <Button
                            onPress={() => router.replace('/success')}
                            fullWidth
                            isLoading={isProcessing}
                            className="plain-green-color text-white"
                        >
                            Confirm & Pay
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div >
    );
}