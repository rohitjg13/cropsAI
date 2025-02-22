"use client";
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";

export default function ExpandableCardAnimals() {
  const [active, setActive] = useState<(typeof Animalcards)[number] | boolean | null>(
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
        {Animalcards.map((card) => (
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

const Animalcards = [
    {
      animal_name: "Lion",
      animal_description: "A large carnivorous mammal known for its strength and majestic mane.",
      disease_name: "Canine Distemper",
      disease_description: "A viral disease affecting the respiratory, gastrointestinal, and nervous systems.",
      causes: "Caused by the Canine Distemper Virus (CDV), often transmitted through direct contact or airborne droplets.",
      symptoms: "Fever, coughing, nasal discharge, diarrhea, seizures, and loss of coordination.",
      prevention_measures: "Vaccination of at-risk animals, avoiding contact with infected animals.",
      treatment: {
        medications: "Antibiotics to prevent secondary bacterial infections, anticonvulsants for seizures.",
        vaccinations: "Canine Distemper Vaccine to prevent infection.",
        natural_remedies: "Supportive care like hydration, a balanced diet, and rest to strengthen the immune system."
      },
      transmission: "Spread through contact with bodily fluids like saliva, urine, or feces of infected animals.",
      risk_factors: "Exposure to infected animals, lack of vaccination, living in overcrowded conditions.",
      affected_species: "Domestic dogs, wolves, foxes, and some wild carnivores.",
      quarantine_measures: "Isolation of infected animals to prevent further spread to others.",
      recovery_time: "2 to 4 weeks with proper treatment, but can be fatal in severe cases.",
      veterinary_consultation: "Immediate veterinary care is necessary to treat and manage symptoms.",
      nearby_vets: "Check local animal clinics or veterinary hospitals for the closest options.",
      content: function() {
        return (
          <>
            <div className="space-y-4">
            <div className="flex flex-col">
                <span className="font-bold">Animal Name:</span> {this.animal_name}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Animal Description:</span> {this.animal_description}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Disease Name:</span> {this.disease_name}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Disease Description:</span> {this.disease_description}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Causes:</span> {this.causes}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Symptoms:</span> {this.symptoms}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Prevention Measures:</span> {this.prevention_measures}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Treatment:</span>
                <ul className="list-disc pl-5">
                <li><span className="font-bold">Medications:</span> {this.treatment.medications}</li>
                <li><span className="font-bold">Vaccinations:</span> {this.treatment.vaccinations}</li>
                <li><span className="font-bold">Natural Remedies:</span> {this.treatment.natural_remedies}</li>
                </ul>
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Transmission:</span> {this.transmission}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Risk Factors:</span> {this.risk_factors}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Affected Species:</span> {this.affected_species}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Quarantine Measures:</span> {this.quarantine_measures}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Recovery Time:</span> {this.recovery_time}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Veterinary Consultation:</span> {this.veterinary_consultation}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Nearby Vets:</span> {this.nearby_vets}
            </div>
            </div>
          </>
        );
      }
    },
    {
      animal_name: "Elephant",
      animal_description: "The largest land mammal, known for its long trunk and tusks.",
      disease_name: "Foot and Mouth Disease",
      disease_description: "A viral disease that affects cloven-hoofed animals, causing fever and blisters.",
      causes: "Caused by the Foot and Mouth Disease Virus (FMDV), transmitted through direct contact with infected animals or contaminated feed.",
      symptoms: "Fever, blisters on the feet, mouth ulcers, drooling, lameness.",
      prevention_measures: "Quarantine infected animals, avoid contact with livestock, use vaccines.",
      treatment: {
        medications: "Supportive treatment to reduce fever and pain, antibiotics to treat secondary infections.",
        vaccinations: "FMD vaccination to prevent infection.",
        natural_remedies: "A balanced diet and proper rest to help the animal recover."
      },
      transmission: "Transmitted through contact with bodily fluids, such as saliva, urine, and feces.",
      risk_factors: "Close proximity to infected animals, lack of proper vaccination, poor hygiene.",
      affected_species: "Cattle, pigs, goats, and some wildlife including elephants.",
      quarantine_measures: "Infected animals should be isolated, and transportation of animals should be restricted.",
      recovery_time: "Approximately 2 weeks with proper care and treatment.",
      veterinary_consultation: "Veterinary consultation is necessary for diagnosis and managing the condition.",
      nearby_vets: "Nearby wildlife veterinary services or zoos should be contacted.",
      content: function() {
        return (
          <>
            <div className="space-y-4">
            <div className="flex flex-col">
                <span className="font-bold">Animal Name:</span> {this.animal_name}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Animal Description:</span> {this.animal_description}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Disease Name:</span> {this.disease_name}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Disease Description:</span> {this.disease_description}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Causes:</span> {this.causes}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Symptoms:</span> {this.symptoms}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Prevention Measures:</span> {this.prevention_measures}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Treatment:</span>
                <ul className="list-disc pl-5">
                <li><span className="font-bold">Medications:</span> {this.treatment.medications}</li>
                <li><span className="font-bold">Vaccinations:</span> {this.treatment.vaccinations}</li>
                <li><span className="font-bold">Natural Remedies:</span> {this.treatment.natural_remedies}</li>
                </ul>
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Transmission:</span> {this.transmission}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Risk Factors:</span> {this.risk_factors}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Affected Species:</span> {this.affected_species}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Quarantine Measures:</span> {this.quarantine_measures}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Recovery Time:</span> {this.recovery_time}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Veterinary Consultation:</span> {this.veterinary_consultation}
            </div>

            <div className="flex flex-col">
                <span className="font-bold">Nearby Vets:</span> {this.nearby_vets}
            </div>
            </div>
          </>
        );
      }
    },
    {
      animal_name: "Dog",
      animal_description: "A domesticated carnivorous mammal, known for its loyalty and companionship.",
      disease_name: "Rabies",
      disease_description: "A deadly viral infection that affects the brain and nervous system, transmitted through bites or saliva.",
      causes: "Caused by the Rabies Virus, usually transmitted by bites from infected animals.",
      symptoms: "Fever, agitation, paralysis, hydrophobia, aggression, and seizures.",
      prevention_measures: "Vaccination and avoiding contact with wild animals.",
      treatment: {
        medications: "No effective treatment once symptoms appear, but rabies vaccine post-exposure can prevent infection.",
        vaccinations: "Rabies vaccination is mandatory for pets in many regions.",
        natural_remedies: "No natural remedies exist for rabies; medical intervention is crucial."
      },
      transmission: "Spread through the saliva of infected animals, usually through bites.",
      risk_factors: "Exposure to rabid animals, lack of vaccination.",
      affected_species: "Humans, dogs, cats, bats, raccoons, and other mammals.",
      quarantine_measures: "Any potentially rabid animal should be quarantined and observed for symptoms.",
      recovery_time: "If untreated, death usually occurs within a few days to weeks after the onset of symptoms.",
      veterinary_consultation: "Immediate consultation with a veterinarian is required if rabies is suspected.",
      nearby_vets: "Local veterinarians or animal shelters should be contacted for further assistance.",
      content: function() {
        return (
          <>
            <p><b>Animal Name:</b> {this.animal_name}</p>
            <p><b>Animal Description:</b> {this.animal_description}</p>
  
            <p><b>Disease Name:</b> {this.disease_name}</p>
            <p><b>Disease Description:</b> {this.disease_description}</p>
  
            <p><b>Causes:</b> {this.causes}</p>
            <p><b>Symptoms:</b> {this.symptoms}</p>
            <p><b>Prevention Measures:</b> {this.prevention_measures}</p>
  
            <p><b>Treatment:</b></p>
            <ul>
              <li><b>Medications:</b> {this.treatment.medications}</li>
              <li><b>Vaccinations:</b> {this.treatment.vaccinations}</li>
              <li><b>Natural Remedies:</b> {this.treatment.natural_remedies}</li>
            </ul>
  
            <p><b>Transmission:</b> {this.transmission}</p>
            <p><b>Risk Factors:</b> {this.risk_factors}</p>
            <p><b>Affected Species:</b> {this.affected_species}</p>
            <p><b>Quarantine Measures:</b> {this.quarantine_measures}</p>
            <p><b>Recovery Time:</b> {this.recovery_time}</p>
            <p><b>Veterinary Consultation:</b> {this.veterinary_consultation}</p>
            <p><b>Nearby Vets:</b> {this.nearby_vets}</p>
          </>
        );
      }
    },
    // More animals can follow the same structure...
];
  


