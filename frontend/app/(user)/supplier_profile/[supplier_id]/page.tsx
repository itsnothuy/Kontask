"use client";

import {
    Card,
    CardHeader,
    CardBody,
    Avatar,
    Divider,
    Button,
    Chip,
} from "@heroui/react";
import { PhoneIcon, GlobeIcon, StarIcon } from "@/components/icons/page";
import { useState } from "react";
import Link from "next/link";

interface Params {
    supplier_id: string;
}

export default function SupplierProfile({ params }: { params: Params }) {
    const [supplierInfo] = useState({
        name: "Elite Affordable Movers & Cleaning",
        rating: 4.3,
        reviews: 67,
        hired: 91,
        location: "Greencastle, IN",
        employees: 9,
        yearsInBusiness: 2,
        price: "$199",
        online: true,
        introduction:
            "A Veteran owned and family operated business with 20 years of experience. We offer full moving services, packing and supply services, move in/out cleaning, deep cleanings, and weekly-bi-weekly cleanings. We also do full cleanouts and donation pickup through our donation program #move2makeadifference. We service residential and commercial customers.",
        paymentMethods: ["Cash", "Credit Card", "Venmo", "Zelle"],
        socialMedia: {
            facebook: "#",
            instagram: "#",
        },
        imageUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d", // Replace with actual profile image
    });

    return (
        <div className="flex flex-col items-center p-8">
            <Card className="w-full max-w-4xl">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar src={supplierInfo.imageUrl} size="lg" />
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold">{supplierInfo.name}</h2>
                        <div className="flex items-center text-sm text-gray-500">
                            <StarIcon width={12} height={12} />
                            <span className="ml-1">{supplierInfo.rating} ({supplierInfo.reviews} reviews)</span>
                        </div>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody>
                    <p className="text-gray-700">{supplierInfo.introduction}</p>

                    <div className="mt-4">
                        <p className="text-lg font-semibold">Overview</p>
                        <div className="flex flex-col mt-2 text-gray-600">
                            <p>📌 Hired {supplierInfo.hired} times</p>
                            <p>📍 Serves {supplierInfo.location}</p>
                            <p>✔ Background checked</p>
                            <p>👥 {supplierInfo.employees} employees</p>
                            <p>📆 {supplierInfo.yearsInBusiness} years in business</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="text-lg font-semibold">Business Details</p>
                        <div className="flex flex-col mt-2 text-gray-600">
                            <p>💰 Starting price: <span className="text-green-600 font-bold">{supplierInfo.price}</span></p>
                            <p>🟢 {supplierInfo.online ? "Online now" : "Offline"}</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="text-lg font-semibold">Payment Methods</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {supplierInfo.paymentMethods.map((method, index) => (
                                <Chip key={index}>{method}</Chip>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                        <Button color="primary" startContent={<PhoneIcon />}>
                            Contact Supplier
                        </Button>
                        <Button variant="light" startContent={<PhoneIcon />}>
                            Check Availability
                        </Button>
                    </div>

                    <div className="mt-4">
                        <p className="text-lg font-semibold">Follow Us</p>
                        <div className="flex gap-4 mt-2">
                            <Link href={supplierInfo.socialMedia.facebook}>
                                <Button startContent={<GlobeIcon />} variant="light">
                                    Facebook
                                </Button>
                            </Link>
                            <Link href={supplierInfo.socialMedia.instagram}>
                                <Button startContent={<GlobeIcon />} variant="light">
                                    Instagram
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
