"use client";
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";

const HOST = "127.0.0.1:6942";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ExpandableCardAnimals({ cards: initialCards }: { cards?: any[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [active, setActive] = useState<any>(null);
  const ref = useRef<HTMLDivElement>(null!);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }
    document.body.style.overflow = active ? "hidden" : "auto";
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  // Function to handle emailing the vet


  // Function to handle sending SMS to the vet using browser geolocation
  const handleSmsVet = (card: any) => {
    const sendSms = (location: string) => {
      const payload = {
        disease_name: card.disease_name,
        animal_name: card.animal_name,
        location: location,
      };
      fetch(`http://${HOST}/smsVet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(response => {
          if (response.ok) {
            alert("SMS sent to vet!");
          } else {
            alert("Failed to send SMS.");
          }
        })
        .catch(error => {
          console.error("Error sending SMS:", error);
          alert("An error occurred.");
        });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
          sendSms(googleMapsLink);
        },
        (error) => {
          // Fallback to manual entry if geolocation fails or is denied
          const loc = window.prompt("Geolocation failed. Please enter your location manually (or provide a maps URL):");
          if (loc) {
            sendSms(loc);
          }
        }
      );
    } else {
      const loc = window.prompt("Geolocation is not supported by your browser. Please enter your location manually (or provide a maps URL):");
      if (loc) {
        sendSms(loc);
      }
    }
  };

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
                  <motion.button
                    layoutId={`button-${active.disease_name}-${id}`}
                    onClick={() => handleSmsVet(active)}
                    className="px-4 py-3 text-sm rounded-2xl font-bold bg-green-500 text-white"
                  >
                    Contact Vet
                  </motion.button>
                </div>
                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 dark:text-neutral-400 text-lg md:text-xl max-h-[50vh] pb-8 flex flex-col items-start gap-4 overflow-auto"
                  >
                    {active.content ? active.content() : (
                      <div className="space-y-3">
                        <p className="text-lg"><strong>Animal:</strong> {active.animal_name}</p>
                        <p className="text-lg"><strong>Description:</strong> {active.animal_description}</p>
                        <p className="text-lg"><strong>Disease:</strong> {active.disease_name}</p>
                        <p className="text-lg"><strong>Disease Description:</strong> {active.disease_description}</p>
                        <p className="text-lg"><strong>Causes:</strong> {active.causes}</p>
                        <p className="text-lg"><strong>Symptoms:</strong> {active.symptoms}</p>
                        <p className="text-lg"><strong>Prevention Measures:</strong> {active.prevention_measures}</p>
                        <div className="space-y-1">
                          <p className="text-lg font-bold">Treatment:</p>
                          <p className="text-lg">
                            <strong>Medications:</strong> {active.treatment?.medications?.join(', ')}
                          </p>
                          <p className="text-lg">
                            <strong>Vaccinations:</strong> {active.treatment?.vaccinations?.join(', ')}
                          </p>
                          <p className="text-lg">
                            <strong>Natural Remedies:</strong> {active.treatment?.natural_remedies?.join(', ')}
                          </p>
                        </div>
                        <p className="text-lg"><strong>Transmission:</strong> {active.transmission}</p>
                        <p className="text-lg"><strong>Risk Factors:</strong> {active.risk_factors}</p>
                        <p className="text-lg">
                          <strong>Affected Species:</strong> {active.affected_species?.join(', ')}
                        </p>
                        <p className="text-lg"><strong>Quarantine Measures:</strong> {active.quarantine_measures}</p>
                        <p className="text-lg"><strong>Recovery Time:</strong> {active.recovery_time}</p>
                        <p className="text-lg">
                          <strong>Veterinary Consultation:</strong> {active.veterinary_consultation}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <ul className="max-w-2xl mx-auto w-full gap-4">
        {(initialCards || []).map((card) => (
          <motion.div
            layoutId={`card-${card.disease_name}-${id}`}
            key={`card-${card.disease_name}-${id}`}
            onClick={() => setActive(card)}
            className="p-4 flex flex-row items-center border border-black hover:border-green-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer transition-all duration-200 w-full max-w-lg"
          >
            {/* Image on the Left */}
            <motion.div layoutId={`image-${card.disease_name}-${id}`} className="flex-shrink-0">
              <Image
                width={100}
                height={100}
                src={card.image}
                alt={card.disease_name}
                className="h-24 w-24 rounded-lg object-cover object-top"
              />
            </motion.div>
            
            {/* Text Content */}
            <div className="flex flex-col ml-4 flex-grow">
              <motion.h3
                layoutId={`title-${card.disease_name}-${id}`}
                className="font-medium text-neutral-800 dark:text-neutral-200 text-left text-lg"
              >
                {card.disease_name}
              </motion.h3>
              <motion.p
                layoutId={`description-${card.disease_description}-${id}`}
                className="text-neutral-600 dark:text-neutral-400 text-left text-sm line-clamp-2"
              >
                {card.disease_description}
              </motion.p>
              
              {/* Contact Vet Button */}
              <motion.button
                layoutId={`button-${card.disease_name}-${id}`}
                onClick={() => setActive(card)}
                className="mt-2 px-4 py-2 text-sm rounded-lg ml-8 font-bold bg-green-500 hover:bg-green-500 hover:text-white text-black self-start"
              >
                Contact Vet
              </motion.button>
            </div>
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
