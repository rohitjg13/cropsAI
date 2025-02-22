'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from 'next/image';
import { DisplayData } from "./data";
import { TopBar,BottomBar } from "./static";

export default function Home() {
    const [pic,updatePic] = useState<string>("");
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          const imageUrl = URL.createObjectURL(file);
          updatePic(imageUrl);
        }
    };
    return (
        <div className="flex flex-col h-screen w-screen items-center justify-center">
            <TopBar />
            <div className="flex flex-col gap-4">
                <div className="w-screen flex justify-center">
                    { pic && (<Image alt="crop pic" src={pic} width={200} height={200} style={{objectFit:"cover"}} />) }
                </div>
                <div className="flex w-screen justify-center gap-4">
                    <Input type="file" accept="image/*" onChange={handleImageChange} className="w-48"/>
                    <Button onClick={() => {}} className="text-sm">Continue</Button>
                </div>
            </div>
            <DisplayData/>
            <BottomBar />
        </div>
    );
}
