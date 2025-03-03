'use client'

import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    return (
        <div>
            <button onClick={() => router.push("/plant")}>Goto to /plant for plant info</button>
            <button onClick={() => router.push("/plant")}>Goto to /animal for animal info</button>
        </div>
    );
}