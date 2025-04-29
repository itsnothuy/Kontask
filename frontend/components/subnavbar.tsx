'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
    Tabs, Tab
} from "@heroui/tabs";

import { Card, CardBody } from "@heroui/react";
import { useState } from 'react';


export const SubNavigationBar = () => {
    const currentRoute = usePathname();

    const [selected, setSelected] = useState<string>("/dashboard");

    return (
        <div className="flex w-full flex-col">
            <Tabs selectedKey={currentRoute} color='success' onSelectionChange={(key) => setSelected(key.toString())}
                classNames={{
                    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                    cursor: "w-full bg-[#259d84]",
                    tab: "max-w-fit px-0 h-12",
                    tabContent: "group-data-[selected=true]:text-[#000000]",
                }}
                variant="underlined"
            >
                <Tab key="/dashboard" title="Dashboard" href='/dashboard' >
                </Tab>
                <Tab key="/post" title="Post" href='/post' >
                </Tab>
                <Tab key="/bidding" title="Bidding" >
                </Tab>
            </Tabs>
        </div>
    );
}