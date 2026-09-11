import React from "react";
import { ChevronDown } from "lucide-react";
import { SUPPORTED_CURRENCIES } from "../utils/currency.js";

export function CurrencyBadge({ currentCurrency, onSelectCurrency, detectedCountry }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border-2 border-blue-500/40 px-3 py-1 text-xs text-white shadow-md shadow-blue-500/10 backdrop-blur-md">
      <span className="text-xs select-none">{currentCurrency.flag}</span>
      <span className="text-[11px] font-semibold text-zinc-100">
        Prices in <strong className="text-blue-400 font-bold underline decoration-blue-400/50">{currentCurrency.code}</strong> ({currentCurrency.symbol})
      </span>
      {detectedCountry && detectedCountry !== "United States" && (
        <span className="text-[10px] text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded font-mono font-bold hidden md:inline border border-blue-400/30">
          {detectedCountry}
        </span>
      )}
      <div className="relative ml-1">
        <select
          value={currentCurrency.code}
          onChange={(e) => {
            const selected = SUPPORTED_CURRENCIES[e.target.value];
            if (selected && onSelectCurrency) {
              onSelectCurrency(selected);
            }
          }}
          className="cursor-pointer appearance-none bg-blue-600/20 border border-blue-400/40 rounded-md py-0.5 pr-5 pl-2 text-[11px] font-bold text-blue-300 hover:text-white hover:bg-blue-600/40 focus:outline-none focus:ring-1 focus:ring-blue-400"
          aria-label="Select pricing currency"
        >
          {Object.values(SUPPORTED_CURRENCIES).map((c) => (
            <option key={c.code} value={c.code} className="bg-zinc-950 text-zinc-100 font-semibold">
              {c.flag} {c.code} ({c.symbol})
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-blue-400" />
      </div>
    </div>
  );
}

export default CurrencyBadge;
