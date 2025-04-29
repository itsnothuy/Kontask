import { NavigationBar } from "@/components/navbar";

export default function ProfileSetupLayout({
    children,
}: Readonly<{
    modal: React.ReactNode;
    children: React.ReactNode;
}>) {
    return (
        <div
            style={{
                display: 'flex', flexDirection: 'column', width: '100%'
            }}
        >
            <div className="w-full h-20">
                <NavigationBar isAuthPage={false} />
            </div>
            <div
                style={{
                    display: 'flex', flexDirection: 'column', height: 'auto', width: 'auto', paddingBottom: '20px', paddingRight: '20px', paddingLeft: '20px'
                }}
            >
                {children}
            </div>
        </div >
    );
}