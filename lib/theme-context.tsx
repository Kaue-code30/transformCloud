"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
type ThemeContextType = { theme: Theme; toggle: () => void };

const ThemeContext = createContext<ThemeContextType>({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  // Aplica/remove a classe no <html> para que elementos fixed também herdem
  useEffect(() => {
    const saved = localStorage.getItem("ds-theme") as Theme | null;
    const initial = saved === "light" ? "light" : "dark";
    setTheme(initial);
    if (initial === "light") document.documentElement.classList.add("ds-light");
  }, []);

  const toggle = () => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      localStorage.setItem("ds-theme", next);
      if (next === "light") {
        document.documentElement.classList.add("ds-light");
      } else {
        document.documentElement.classList.remove("ds-light");
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
