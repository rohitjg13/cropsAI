"use client";
import Image from "next/image";
import React, { JSX, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";

// Define your Treatment and PlantCard interfaces
export interface Treatment {
  fertilizers: string;
  pesticides: string;
  biological_control: string;
}

export interface PlantCard {
  crop_name: string;
  crop_description: string;
  disease_name: string;
  disease_description: string;
  causes: string;
  symptoms: string;
  prevention_measures: string;
  treatment: Treatment;
  climatic_factors: string;
  soil_requirements: string;
  crop_rotation_suggestions: string;
  image: string;
  link?: string;
  content?: () => JSX.Element;
}

interface ExpandableCardPlantsProps {
  cards?: PlantCard[];
}

const DefaultCardContent: React.FC<{ card: PlantCard }> = ({ card }) => {
  return (
    <div className="space-y-3">
      <p className="text-lg">
        <strong>Crop:</strong> {card.crop_name}
      </p>
      <p className="text-lg">
        <strong>Description:</strong> {card.crop_description}
      </p>
      <p className="text-lg">
        <strong>Disease:</strong> {card.disease_name}
      </p>
      <p className="text-lg">
        <strong>Disease Description:</strong> {card.disease_description}
      </p>
      <p className="text-lg">
        <strong>Causes:</strong> {card.causes}
      </p>
      <p className="text-lg">
        <strong>Symptoms:</strong> {card.symptoms}
      </p>
      <p className="text-lg">
        <strong>Prevention:</strong> {card.prevention_measures}
      </p>
      <p className="text-lg">
        <strong>Treatment:</strong> Fertilizers: {card.treatment.fertilizers}, Pesticides: {card.treatment.pesticides}, Biological Control: {card.treatment.biological_control}
      </p>
      <p className="text-lg">
        <strong>Climatic Factors:</strong> {card.climatic_factors}
      </p>
      <p className="text-lg">
        <strong>Soil Requirements:</strong> {card.soil_requirements}
      </p>
      <p className="text-lg">
        <strong>Rotation Suggestions:</strong> {card.crop_rotation_suggestions}
      </p>
    </div>
  );
};

export default function ExpandableCardPlants({ cards: initialCards }: ExpandableCardPlantsProps) {
  const [active, setActive] = useState<PlantCard | null>(null);
  const [cards, setCards] = useState<PlantCard[]>(initialCards || []);
  const ref = useRef<HTMLDivElement>(null!);
  const id = useId();

  useEffect(() => {
    if (!initialCards) {
      async function fetchData() {
        try {
          const res = await fetch("/data/plant-cards.json"); // fallback to fetch if no cards passed
          const data = await res.json();
          setCards(data);
        } catch (error) {
          console.error("Error fetching plant cards", error);
        }
      }
      fetchData();
    }
  }, [initialCards]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActive(null);
    }
    document.body.style.overflow = active ? "hidden" : "auto";
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.disease_name}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.disease_name}-${id}`}
              ref={ref}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[80%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden shadow-lg"
            >
              <motion.div layoutId={`image-${active.disease_name}-${id}`}>
                <Image
                  priority
                  width={200}
                  height={200}
                  src={active.image}
                  alt={active.disease_name}
                  className="w-full h-60 lg:h-60 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </motion.div>
              <div>
                <div className="flex justify-between items-start p-4">
                  <div>
                    <motion.h3
                      layoutId={`title-${active.disease_name}-${id}`}
                      className="font-bold text-neutral-700 dark:text-neutral-200 text-2xl"
                    >
                      {active.disease_name}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.disease_description}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400 text-sm mt-2"
                    >
                      {active.disease_description}
                    </motion.p>
                  </div>
                  <motion.a
                    layoutId={`button-${active.disease_name}-${id}`}
                    href={active.link || "#"}
                    target="_blank"
                    className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white"
                  >
                    Link
                  </motion.a>
                </div>
                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 dark:text-neutral-400 text-lg md:text-xl max-h-[50vh] pb-8 flex flex-col items-start gap-4 overflow-auto"
                  >
                    {active.content ? active.content() : <DefaultCardContent card={active} />}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <ul className="max-w-2xl mx-auto w-full gap-4">
        {cards.map((card) => (
          <motion.div
            layoutId={`card-${card.disease_name}-${id}`}
            key={`card-${card.disease_name}-${id}`}
            onClick={() => setActive(card)}
            className="p-4 flex flex-col md:flex-row justify-between items-center border border-black hover:border-green-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer transition-all duration-200"
          >
            <div className="flex gap-4 flex-col md:flex-row items-center">
              <motion.div layoutId={`image-${card.disease_name}-${id}`}>
                <Image
                  width={100}
                  height={100}
                  src={card.image}
                  alt={card.disease_name}
                  className="h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-top"
                />
              </motion.div>
              <div>
                <motion.h3
                  layoutId={`title-${card.disease_name}-${id}`}
                  className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-xl"
                >
                  {card.disease_name}
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.disease_description}-${id}`}
                  className="text-neutral-600 dark:text-neutral-400 text-center md:text-left text-lg line-clamp-2"
                >
                  {card.disease_description}
                </motion.p>
              </div>
            </div>
            <motion.button
              layoutId={`button-${card.disease_name}-${id}`}
              className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black mt-4 md:mt-0"
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
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


