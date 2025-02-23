"use client";
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";

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
            className="p-4 flex flex-row items-center border border-black hover:border-green-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer transition-all duration-200"
          >
            <motion.div layoutId={`image-${card.disease_name}-${id}`} className="flex-shrink-0">
              <Image
                width={80}
                height={80}
                src={card.image}
                alt={card.disease_name}
                className="h-20 w-20 rounded-lg object-cover object-top"
              />
            </motion.div>
            <div className="ml-4 flex flex-col justify-center flex-grow">
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
