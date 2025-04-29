'use client';

import { StarIcon } from "@/components/icons/star-icon";
import { Listbox, ListboxItem, Card, CardHeader, CardBody, Divider, Button, CardFooter, Slider } from "@heroui/react";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { RecommendedSupplier } from "@/components/recommended_supplier";
import { usePostMatchingContext } from "../layout";
import { getUserByID, matchPost } from "@/services/home";

export default function RecommendPage() {
    const postMatchingContext = usePostMatchingContext();

    if (!postMatchingContext) {
        return <div>Error: PostMatchingContext is null</div>;
    }
    const { content } = postMatchingContext;

    const [selectedDateKey, setSelectedDateKey] = useState<string>("Today");
    const [selectedTimeKeys, setSelectedTimeKeys] = useState<Set<string>>(new Set());

    interface Tasker {
        id: string;
        name: string;
        avatarUrl: string;
        rating: number;
        description: string;
        reasoning: string;
    }

    const [taskers, setTaskers] = useState<Tasker[]>([]);
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
    ]

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
    ]



    const queryMatchingSupplier = async () => {
        const data = await matchPost(content);
        const results = data.data.results;
        console.log(results);

        if (results.length > 0) {
            console.log(results);
            const updatedTaskers = results.map((result: any) => {
                if (result.detail === undefined) {
                    return {
                        id: result.id,
                        name: result.name,
                        avatarUrl: result.avatar_url,
                        rating: result.review_rating,
                        description: result.experience_description,
                        reasoning: result.structured_summary.reasoning,
                    };
                }
            });
            console.log(updatedTaskers);
            setTaskers(updatedTaskers);
        }
        // Query the matching supplier based on the selectedDateKey and selectedTimeKeys
    };

    useEffect(() => {
        queryMatchingSupplier();
    }
        , []);

    return (
        <div className="h-full flex-row flex gap-4 justify-center px-8">
            {/* Left side - Suggestion and Filter */}
            <div className="w-1/6 flex flex-col gap-4">
                <Card className="flex-col justify-center">
                    <CardHeader className="px-4 flex-row justify-between" >
                        <p className="text-lg feed-title-text">Date</p>
                    </CardHeader>

                    <Divider />
                    <CardBody className="p-4 h-auto w-full flex justify-center items-center">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {filterDateKeys.map((filter) => (
                                <Button
                                    key={filter.key}
                                    radius="lg"
                                    className={`text-default-600 ${selectedDateKey == filter.key ? 'plain-green-color text-white ' : ''}`}
                                    variant={selectedDateKey == filter.key ? 'flat' : 'bordered'}
                                    size="md"
                                    onPress={() => {
                                        setSelectedDateKey(filter.key);
                                    }}
                                >
                                    {filter.title}
                                </Button>
                            ))}
                        </div>
                    </CardBody>
                </Card>
                <Card className="flex-col justify-center h-auto">
                    <CardHeader className="px-4 flex-row justify-between" >
                        <p className="text-lg feed-title-text">Time of Day</p>
                    </CardHeader>
                    <Divider />
                    <CardBody className="w-full p-0">
                        <Listbox
                            className="w-full p-0 m-0"
                            aria-label="Multiple selection example"
                            selectedKeys={selectedTimeKeys}
                            selectionMode="multiple"
                            variant="flat"
                            onSelectionChange={(keys) => setSelectedTimeKeys(new Set(keys as unknown as string[]))}>
                            {filterTimeKeys.map((filter) => (
                                <ListboxItem className="pl-4 pr-5 py-3 text-md" key={filter.key}>
                                    <span className={`text-md text-default-600`}>{filter.title}</span>
                                </ListboxItem>
                            ))}
                        </Listbox>
                    </CardBody>
                </Card>
                <Card className="flex-col justify-center h-auto">
                    <CardHeader className="px-4 flex-row justify-between" >
                        <p className="text-lg feed-title-text">Price</p>
                    </CardHeader>
                    <Divider />
                    <CardBody className="w-full p-4">
                        <Slider
                            classNames={{
                                base: "max-w-md gap-3 text-default-600",
                                filler: "gradient-color",
                                thumb: "gradient-color",
                            }}
                            defaultValue={[100, 500]}
                            formatOptions={{ style: "currency", currency: "USD" }}
                            label="Price Range"
                            size="sm"
                            maxValue={1000}
                            minValue={0}
                            step={50}
                        />
                    </CardBody>
                </Card>
            </div>
            {/* Middle side - Supplier Content */}
            <div className="w-1/2 flex flex-col gap-4">
                {
                    taskers.map((tasker) => (
                        <RecommendedSupplier supplier={tasker} />
                    ))
                }
            </div>
        </div >
    );
}