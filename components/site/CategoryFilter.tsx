import Link from "next/link";
import type { ProductKind } from "@/types/content";

type FilterOption = "all" | ProductKind;

const options: FilterOption[] = ["all", "album", "beat", "plugin", "merch", "digital-download"];

interface CategoryFilterProps {
  selected: FilterOption;
}

export function CategoryFilter({ selected }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const isActive = option === selected;
        const href = option === "all" ? "/store" : `/store?category=${option}`;
        return (
          <Link
            key={option}
            href={href}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition ${
              isActive
                ? "border-amber-200 bg-amber-200 text-black"
                : "border-white/20 text-zinc-200 hover:border-white/40"
            }`}
          >
            {option.replace("-", " ")}
          </Link>
        );
      })}
    </div>
  );
}
