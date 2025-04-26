import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/components";
import {
  registerUser,
  loginUser,
  logoutUser,
  addFundsToWallet
} from "@/components/auth-service";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, studentId: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addFunds: (amount: number) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,

          login: async (email: string, password: string) => {
            set({ isLoading: true, error: null });

            try {
              const user = await loginUser(email, password);
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
              });
              return true;
            } catch (error) {
              set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to login"
              });
              return false;
            }
          },

          register: async (name: string, email: string, studentId: string, password: string) => {
            set({ isLoading: true, error: null });

            try {
              const user = await registerUser(name, email, studentId, password);
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
              });
              return true;
            } catch (error) {
              set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to register"
              });
              return false;
            }
          },

          logout: async () => {
            set({ isLoading: true });

            try {
              await logoutUser();
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });
            } catch (error) {
              set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to logout"
              });
            }
          },

          addFunds: async (amount: number) => {
            const user = get().user;
            if (!user) return;

            try {
              await addFundsToWallet(user.id, amount);
              set({
                user: {
                  ...user,
                  walletBalance: user.walletBalance + amount,
                },
              });
            } catch (error) {
              set({
                error: error instanceof Error ? error.message : "Failed to add funds"
              });
            }
          },

          clearError: () => {
            set({ error: null });
          },
        }),
        {
          name: "auth-storage",
          storage: createJSONStorage(() => AsyncStorage),
        }
    )
);