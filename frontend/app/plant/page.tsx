'use client';

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { TopBar, BottomBar } from "@/components/static";
import ExpandableCardPlants from "@/components/ui/expandable-card-demo-standard-plants";
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";
import React, { useState } from "react";

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

export default function Home() {
  // Store the uploaded files
  const [files, setFiles] = useState<File[]>([]);
  // Loading state for the loader UI
  const [loading, setLoading] = useState(false);
  // State for plant card data; initially no card is shown.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [plantCardsData, setPlantCardsData] = useState<any[]>([]);

  // Handle file selections
  const handleFileUpload = (files: File[]) => {
    setFiles(files);
    console.log(files);
  };

  // When user clicks Continue, POST the file to the backend
  const handleContinue = async () => {
    if (files.length === 0) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', files[0]);
    try {
      const response = await fetch("http://152.53.53.89:5000/cropPrediction", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      if (data.image) {
        // If the image string doesn't include a data URI header, add it.
        let base64Str = data.image;
        if (!base64Str.startsWith("data:")) {
          base64Str = `data:image/jpeg;base64,${base64Str}`;
        }
        // Convert base64 to a Blob and create an object URL
        const blob = dataURItoBlob(base64Str);
        data.image = URL.createObjectURL(blob);
      }
      console.log(data);
      // Prepend the new card data so that plantCardsData shows the returned card.
      setPlantCardsData([data, ...plantCardsData]);
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
          {/* Render expandable cards only if plantCardsData is non-empty */}
          {plantCardsData.length > 0 && (
            <ExpandableCardPlants cards={plantCardsData} />
          )}
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