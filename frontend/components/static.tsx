'use client'

import { Wheat,Dog,User,Sprout } from "lucide-react";
import { useRouter } from "next/navigation";

const TopBar = () => (
    <div className="flex w-screen justify-center items-center h-16 bg-blue-200 gap-2">
        <Sprout size={28} />
        <p className="text-xl"><strong>Crops-LiveStock-AI</strong></p>
    </div>
);

const BottomBar = () => {
    const router = useRouter();
    return (
        <div className="w-screen flex justify-between items-center h-16 bg-blue-200 pl-4 pr-4">
            <div className="flex flex-col h-full justify-center items-center">
                <button 
                    onClick={() => router.push("/plant")} 
                    className="flex flex-col rounded-lg h-full w-auto pl-4 pr-4 justify-center items-center bg-blue-200 hover:bg-red-200"
                >
                    <Wheat size={24} />
                    <p className="text-sm">Crop</p>
                </button>
            </div>
            <div className="flex flex-col h-full justify-center items-center">
                <button 
                    onClick={() => router.push("/animal")}
                    className="flex flex-col rounded-lg h-full w-auto pl-4 pr-4 justify-center items-center bg-blue-200 hover:bg-red-200"
                >
                    <Dog size={24} />
                    <p className="text-sm">Livestock</p>
                </button>
            </div>
            <div className="flex flex-col h-full justify-center items-center">
                <button className="flex flex-col rounded-lg h-full w-auto pl-4 pr-4 justify-center items-center bg-blue-200 hover:bg-red-200">
                    <User size={24} />
                    <p className="text-sm">Profile</p>
                </button>
            </div>
        </div>
    );
}

export { TopBar,BottomBar };