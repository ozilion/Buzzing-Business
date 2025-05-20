import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatLargeNumber(num: number): string {
  if (num === null || num === undefined) return '0';
  
  const absNum = Math.abs(num);

  if (absNum < 1000) {
    // For numbers less than 1000, show up to two decimal places if not an integer
    // Ensure negative sign is preserved
    const value = num % 1 !== 0 ? num.toFixed(2) : String(num);
    return value;
  }

  const suffixes = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "O", "N"]; // Up to Nonillion (10^30)
  const magnitude = Math.floor(Math.log10(absNum) / 3);

  if (magnitude >= suffixes.length) {
    // Fallback for numbers larger than Nonillion
    return num.toExponential(1); // Use 1 decimal for exponential
  }

  const scaledNum = num / Math.pow(1000, magnitude);
  let formattedNum;

  if (Math.abs(scaledNum) < 10 && scaledNum % 1 !== 0) {
    formattedNum = scaledNum.toFixed(1);
  } else {
    formattedNum = String(Math.floor(scaledNum));
  }
  
  return formattedNum + suffixes[magnitude];
}
