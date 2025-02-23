'use client';

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { TopBar, BottomBar } from "@/components/static";
import ExpandableCardPlants from "@/components/ui/expandable-card-demo-standard-plants";
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";

import React, { useState } from "react";

const plantCardsData = [
    {
        "crop_name": "Wheat",
        "crop_description": "A widely cultivated cereal grain, essential for human consumption.",
        "disease_name": "Rust Disease",
        "disease_description": "A fungal disease causing orange-brown pustules on leaves and stems.",
        "causes": "Caused by fungal spores, often spread by wind and humid conditions.",
        "symptoms": "Orange-brown pustules on leaves, stunted growth, and reduced grain yield.",
        "prevention_measures": "Use resistant varieties, proper field sanitation, and avoid excessive irrigation.",
        "treatment": {
            "fertilizers": "Apply nitrogen-rich fertilizers.",
            "pesticides": "Use fungicides like Propiconazole.",
            "biological_control": "Introduce beneficial microbes."
        },
        "climatic_factors": "Prefers cool, dry climates.",
        "soil_requirements": "Well-drained loamy soil with a pH of 6-7.",
        "crop_rotation_suggestions": "Rotate with legumes to enhance soil fertility.",
        "image": "/OIP.jpeg",
        "link": "https://example.com/wheat"
    }
];

const loadingStates = [
  { text: "Uploading Image" },
  { text: "Analyzing Image" },
  { text: "Detecting Plant Type" },
  { text: "Getting More info" },
  { text: "Getting response back" },
  { text: "Hang tight, we're working our magic!" },
  { text: "Almost there, just a moment longer..." },
  { text: "Good things take a little time!" },
  { text: "Stay tuned, finishing up!" },
  { text: "Just a few more seconds..." },
  { text: "Prepare to be amazed!" },
];

export default function Home() {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const handleFileUpload = (files: File[]) => {
        setFiles(files);
        console.log(files);
    };

    return (
        <div>
            <Loader loadingStates={loadingStates} loading={loading} duration={2000} />
            <header className="fixed top-0 left-0 right-0 z-50">
                <TopBar />
            </header>

            <main className="relative min-h-screen overflow-y-auto pt-[32px] pb-[32px] bg-white">
                <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex justify-center w-full">
                            <FileUpload onChange={handleFileUpload} />
                        </div>
                        <div className="flex justify-center w-full">
                            <Button onClick={() => {
                                setLoading(true)
                            }} className="text-sm w-auto h-auto">
                                Continue
                            </Button>
                        </div>
                    </div>
                    {/* Pass the JSON variable as props */}
                    <ExpandableCardPlants cards={plantCardsData} />
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 z-50">
                <BottomBar />
            </footer>
            {loading && (
                <button
                className="fixed top-4 right-4 text-black dark:text-white z-[120]"
                onClick={() => setLoading(false)}
                >
                <IconSquareRoundedX className="h-10 w-10" />
                </button>
            )}

        </div>
    );
}