'use client';

import { Input } from "@/components/ui/input";
import { useState } from "react";
import Image from 'next/image';

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
            <Input type="file" accept="image/*" onChange={handleImageChange} className="w-48"/>
            {pic && (
                <Image alt="crop pic" src={pic} width={100} height={100}></Image>
            )
            }
        </div>
    );
}
