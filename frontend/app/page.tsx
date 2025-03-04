'use client';

import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Welcome</h1>
            <div className="space-y-4 w-full max-w-xs">
                <button 
                    className="w-full py-3 px-5 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
                    onClick={() => router.push("/plant")}
                >
                    Go to Plant Info
                </button>
                <button 
                    className="w-full py-3 px-5 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition"
                    onClick={() => router.push("/animal")}
                >
                    Go to Animal Info
                </button>
                <button 
                    className="w-full py-3 px-5 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600 transition"
                    onClick={() => router.push("/ml-local")}
                >
                    ML Model Testing
                </button>
            </div>
        </div>
    );
}
