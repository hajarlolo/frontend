import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle({ className }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      className={`p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brandViolet dark:hover:text-amber-400 transition-all duration-300 focus:outline-none ${className}`}
      title={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
    >
      {isDark ? (
        <FaSun className="text-xl animate-in spin-in-180 duration-500" />
      ) : (
        <FaMoon className="text-xl animate-in spin-in-180 duration-500" />
      )}
    </button>
  );
}
