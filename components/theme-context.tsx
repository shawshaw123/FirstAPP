import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/Colors";

type ThemeType = "dark" | "light";

interface ThemeContextType {
  theme: ThemeType;
  colors: typeof Colors.dark;
  toggleTheme: () => void;
  isDark: boolean;
  isAndroid: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  colors: Colors.dark,
  toggleTheme: () => {},
  isDark: true,
  isAndroid: Platform.OS === 'android',
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeType;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "dark"
}) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved theme from storage
    const loadTheme = async () => {
      setIsLoading(true);
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme) {
          setTheme(savedTheme as ThemeType);
        } else {
          // Use provided default theme if no saved theme
          setTheme(defaultTheme);
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [defaultTheme]);

  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem("theme", newTheme);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  // Always use dark theme colors
  const colors = Colors.dark;
  const isDark = true;
  const isAndroid = Platform.OS === 'android';

  // Provide loading state to prevent flash of wrong theme
  if (isLoading) {
    return null; // Or a loading indicator
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark, isAndroid }}>
      {children}
    </ThemeContext.Provider>
  );
};