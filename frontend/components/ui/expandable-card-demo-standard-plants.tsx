"use client";
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";

export default function ExpandableCardPlants() {
  const [active, setActive] = useState<(typeof Plantcards)[number] | boolean | null>(
    null
  );
  const ref = useRef<HTMLDivElement>(null!);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0  grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.disease_name}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.disease_name}-${id}`}
              ref={ref}
              className="w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-purple-300 dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.disease_name}-${id}`}>
                <Image
                  priority
                  width={200}
                  height={200}
                  src={"/OIP.jpeg"}
                  alt={active.disease_name}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.disease_name}-${id}`}
                      className="font-bold text-neutral-700 dark:text-neutral-200"
                    >
                      {active.disease_name}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.disease_description}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {active.disease_description}
                    </motion.p>
                  </div>

                  <motion.a
                    layoutId={`button-${active.disease_name}-${id}`}
                    href={active.symptoms}
                    target="_blank"
                    className="px-4 py-3 text-sm rounded-lg font-bold bg-green-500 text-white"
                  >
                    Link
                  </motion.a>
                </div>
                <div className="w-full max-w-[500px] h-[100vh] flex flex-col bg-purple-300 dark:bg-neutral-900 sm:rounded-3xl overflow-hidden pl-4 pr-4 ">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-[calc(95vh-400px)] pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {active.content()}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="max-w-2xl mx-auto w-full flex flex-col gap-[32px]">
        {Plantcards.map((card) => (
          <motion.div
            layoutId={`card-${card.disease_name}-${id}`}
            key={`card-${card.disease_name}-${id}`}
            onClick={() => setActive(card)}
            className="bg-purple-300 p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
          >
            <div className="flex gap-4 flex-col md:flex-row items-center md:items-center justify-center md:justify-center">
              <motion.div layoutId={`image-${card.disease_name}-${id}`}>
                <Image
                  width={100}
                  height={100}
                  src={"/OIP.jpeg"}
                  alt={card.disease_name}
                  className="h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-top"
                />
              </motion.div>
              <div className="">
                <motion.h3
                  layoutId={`title-${card.disease_name}-${id}`}
                  className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                >
                  {card.disease_name}
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.disease_description}-${id}`}
                  className="text-neutral-600 dark:text-neutral-400 text-center md:text-left"
                >
                  {card.disease_description}
                </motion.p>
              </div>
            </div>
            <motion.button
              layoutId={`button-${card.disease_name}-${id}`}
              className="px-4 py-2 text-sm rounded-lg font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black mt-4 md:mt-0"
            >
              Link
            </motion.button>
          </motion.div>
        ))}
      </ul>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

const Plantcards = [
  {
    crop_name: "Wheat",
    crop_description: "A widely cultivated cereal grain, essential for human consumption.",
    disease_name: "Rust Disease",
    disease_description: "A fungal disease causing orange-brown pustules on leaves and stems.",
    causes: "Caused by fungal spores, often spread by wind and humid conditions.",
    symptoms: "Orange-brown pustules on leaves, stunted growth, and reduced grain yield.",
    prevention_measures: "Use resistant varieties, ensure proper field sanitation, and avoid excessive irrigation.",
    treatment: {
      fertilizers: "Apply nitrogen-rich fertilizers to strengthen plant immunity.",
      pesticides: "Use fungicides like Propiconazole for effective disease control.",
      biological_control: "Introduce beneficial microbes that inhibit fungal growth."
    },
    climatic_factors: "Prefers cool, dry climates with temperatures between 15-25°C.",
    soil_requirements: "Well-drained loamy soil with a pH of 6-7.",
    crop_rotation_suggestions: "Rotate with legumes like chickpeas to enhance soil fertility.",
    content: function() {
      return (
        <>
          <p><b>Crop Name:</b> {this.crop_name}</p>
          <p><b>Crop Description:</b> {this.crop_description}</p>

          <p><b>Disease Name:</b> {this.disease_name}</p>
          <p><b>Disease Description:</b> {this.disease_description}</p>

          <p><b>Causes:</b> {this.causes}</p>
          <p><b>Symptoms:</b> {this.symptoms}</p>
          <p><b>Prevention Measures:</b> {this.prevention_measures}</p>

          <p><b>Treatment:</b></p>
            <ul>
              <li><b>Fertilizers:</b> {this.treatment.fertilizers}</li>
              <li><b>Pesticides:</b> {this.treatment.pesticides}</li>
              <li><b>Biological Control:</b> {this.treatment.biological_control}</li>
            </ul>

          <p><b>Climatic Factors:</b> {this.climatic_factors}</p>
          <p><b>Soil Requirements:</b> {this.soil_requirements}</p>
          <p><b>Crop Rotation Suggestions:</b> {this.crop_rotation_suggestions}</p>
        </>
      );
    }
  },
  {
    crop_name: "Rice",
    crop_description: "A staple food crop grown in waterlogged conditions.",
    disease_name: "Bacterial Leaf Blight",
    disease_description: "A bacterial disease causing leaf wilting and yellowing.",
    causes: "Caused by Xanthomonas oryzae, spreading through infected seeds and rain splash.",
    symptoms: "Yellowing of leaf margins, wilting, and reduced grain formation.",
    prevention_measures: "Use disease-free seeds, maintain proper field drainage, and avoid excessive nitrogen application.",
    treatment: {
      fertilizers: "Balanced use of potassium fertilizers to boost resistance.",
      pesticides: "Apply copper-based bactericides to limit spread.",
      biological_control: "Use antagonistic bacteria like Bacillus subtilis to suppress infection."
    },
    climatic_factors: "Requires warm temperatures (25-35°C) and high humidity.",
    soil_requirements: "Clayey soil with good water retention and a pH of 5-6.5.",
    crop_rotation_suggestions: "Rotate with pulses like mung beans to break disease cycles.",
    content: function() {
      return(
        <>
          <p><b>Crop Name:</b> {this.crop_name}</p>
          <p><b>Crop Description:</b> {this.crop_description}</p>

          <p><b>Disease Name:</b> {this.disease_name}</p>
          <p><b>Disease Description:</b> {this.disease_description}</p>

          <p><b>Causes:</b> {this.causes}</p>
          <p><b>Symptoms:</b> {this.symptoms}</p>
          <p><b>Prevention Measures:</b> {this.prevention_measures}</p>

          <p><b>Treatment:</b></p>
            <ul>
              <li><b>Fertilizers:</b> {this.treatment.fertilizers}</li>
              <li><b>Pesticides:</b> {this.treatment.pesticides}</li>
              <li><b>Biological Control:</b> {this.treatment.biological_control}</li>
            </ul>

          <p><b>Climatic Factors:</b> {this.climatic_factors}</p>
          <p><b>Soil Requirements:</b> {this.soil_requirements}</p>
          <p><b>Crop Rotation Suggestions:</b> {this.crop_rotation_suggestions}</p>
        </>
      );
    }
  },
  // ... other crops follow the same pattern
];


