'use client';

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { TopBar, BottomBar } from "@/components/static";
import ExpandableCardAnimals from "@/components/ui/expandable-card-demo-standard-animals";
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";
import React, { useState } from "react";

const loadingStates = [
  { text: "Uploading Image" },
  { text: "Analyzing Image" },
  { text: "Detecting Animal" },
  { text: "Fetching Additional Data" },
  { text: "Processing Image" },
  { text: "Almost there..." },
  { text: "Finalizing result" },
];

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [animalCardsData, setAnimalCardsData] = useState<any[]>([]);

  const handleFileUpload = (files: File[]) => {
    setFiles(files);
    console.log(files);
  };

  // Function to convert base64 data URI to Blob
  function dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  const handleContinue = async () => {
    if (files.length === 0) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", files[0]);
    try {
      const response = await fetch("http://127.0.0.1:6942/animalPrediction", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      console.log(data);
      if (data.image) {
        let base64Str = data.image;
        if (!base64Str.startsWith("data:")) {
          base64Str = `data:image/png;base64,${base64Str}`;
        }
        const blob = dataURItoBlob(base64Str);
        data.image = URL.createObjectURL(blob);
      }
      console.log(data);
      setAnimalCardsData([data, ...animalCardsData]);
    } catch (error) {
      console.error("Error during prediction:", error);
    } finally {
      setLoading(false);
    }
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
              <Button onClick={handleContinue} className="text-sm w-auto h-auto">
                Continue
              </Button>
            </div>
          </div>
          {animalCardsData.length > 0 && <ExpandableCardAnimals cards={animalCardsData} />}
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