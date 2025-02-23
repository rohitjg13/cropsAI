'use client';

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { TopBar, BottomBar } from "@/components/static";
import ExpandableCardAnimals from "@/components/ui/expandable-card-demo-standard-animals";
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";
import React, { useState } from "react";

const HOST = "127.0.0.1:6942";

const loadingStates = [
  { text: "Uploading Image" },
  { text: "Analyzing Image" },
  { text: "Detecting Animal" },
  { text: "Fetching Additional Data" },
  { text: "Processing Image" },
  { text: "Almost there..." },
  { text: "Finalizing result" },
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      const response = await fetch(`http://${HOST}/animalPrediction`, {
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
            <div className="flex justify-center w-full mt-8">
              <FileUpload onChange={handleFileUpload} />
            </div>
            <div className="flex justify-center w-full">
              <Button onClick={handleContinue} className="text-sm w-auto h-auto">
                Continue
              </Button>
            </div>
          </div>
          {/* <div className="flex justify-center w-full mt-2 ml-4"><strong><u>Possible Causes: </u></strong></div> */}
          <br />
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

// const mockAnimalCardsData = [
//   {
//       animal_name: "Cow",
//       animal_description: "A large domesticated bovine commonly raised for milk and beef.",
//       disease_name: "Bovine Mastitis",
//       disease_description: "Inflammation of the cow's mammary gland caused by bacterial infection.",
//       causes: "Bacterial infection, poor hygiene, and teat injuries.",
//       symptoms: "Swollen udder, abnormal milk, and fever.",
//       prevention_measures: "Proper milking hygiene, regular cleaning, and vaccination.",
//       treatment: {
//           medications: ["Antibiotics", "Anti-inflammatory drugs"],
//           vaccinations: ["Mastitis Vaccine"],
//           natural_remedies: ["Herbal teas", "Probiotics"]
//       },
//       transmission: "Spread via milking equipment and contaminated hands.",
//       risk_factors: "Stress, poor nutrition, and unsanitary living conditions.",
//       affected_species: ["Cows"],
//       quarantine_measures: "Isolate infected animals and disinfect all equipment.",
//       recovery_time: "2-3 weeks with proper treatment.",
//       veterinary_consultation: "Seek veterinary advice immediately upon symptom detection.",
//       image: "/OIP.jpeg"
//   }
// ]