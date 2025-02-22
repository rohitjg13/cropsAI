'use client';

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { TopBar, BottomBar } from "@/components/static";
import ExpandableCardPlants from "@/components/ui/expandable-card-demo-standard-plants";

export default function Home() {
    return (
        <div>
            <header className="fixed top-0 left-0 right-0 z-50">
                <TopBar />
            </header>

            <main className="relative min-h-screen overflow-y-auto pt-[32px] pb-[32px] bg-white">
                <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex justify-center w-full">
                            <FileUpload />
                        </div>
                        <div className="flex justify-center w-full">
                            <Button onClick={() => {}} className="text-sm w-auto h-auto">
                                Continue
                            </Button>
                        </div>
                    </div>
                    <ExpandableCardPlants />
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 z-50">
                <BottomBar />
            </footer>
        </div>
    );
}