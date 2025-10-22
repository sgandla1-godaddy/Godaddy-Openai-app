import { useOpenAiGlobal } from "./use-openai-global";
import { type Theme } from "./types";

/**
 * Hook to get the current ChatGPT theme (light or dark)
 * @returns "light" | "dark" | null
 */
export const useTheme = (): Theme | null => {
  return useOpenAiGlobal("theme");
};

