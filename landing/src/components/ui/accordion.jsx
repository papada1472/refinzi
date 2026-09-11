import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Accessible accordion in the modern minimal style.
 */
export function Accordion({ children, className = "", ...props }) {
  return (
    <div
      className={`w-full rounded-2xl border-2 border-white/[0.12] bg-zinc-900/70 divide-y-2 divide-white/[0.10] overflow-hidden backdrop-blur-md shadow-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AccordionItem({ question, answer, className = "" }) {
  const [open, setOpen] = useState(false);
  const panelId = `accordion-panel-${question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-150 cursor-pointer select-none ${
          open
            ? "bg-blue-600/10 text-blue-300 font-bold text-sm sm:text-base"
            : "text-white font-bold text-sm sm:text-base hover:bg-white/[0.04] hover:text-blue-200"
        }`}
      >
        <span className="leading-snug">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-blue-400" : "text-zinc-400"
          }`}
        />
      </button>
      <div
        id={panelId}
        role="region"
        hidden={!open}
        className="grid px-5 pb-5 pt-2 text-xs sm:text-sm leading-relaxed text-zinc-200 font-normal bg-zinc-950/40"
      >
        <span>{answer}</span>
      </div>
    </div>
  );
}

export default Accordion;
