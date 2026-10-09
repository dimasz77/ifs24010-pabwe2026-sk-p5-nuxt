import { defineStore } from "pinia";
import authApi from "../api/authApi";
import apiHelper from "../../../helpers/apiHelper";
import { getErrorMessage, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export interface AuthState {
  isAuthRegister: boolean;
  isAuthRegistered: boolean;
  isAuthLogin: boolean;
  isAuthLoggedIn: boolean;
  isAuthLogout: boolean;
  isAuthLoggedOut: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    isAuthRegister: false,
    isAuthRegistered: false,
    isAuthLogin: false,
    isAuthLoggedIn: false,
    isAuthLogout: false,
    isAuthLoggedOut: false,
  }),
  actions: {
    setIsAuthRegister(status: boolean): void {
      this.isAuthRegister = status;
    },
    setIsAuthRegistered(status: boolean): void {
      this.isAuthRegistered = status;
    },
    setIsAuthLogin(status: boolean): void {
      this.isAuthLogin = status;
    },
    setIsAuthLoggedIn(status: boolean): void {
      this.isAuthLoggedIn = status;
    },
    setIsAuthLogout(status: boolean): void {
      this.isAuthLogout = status;
    },
    setIsAuthLoggedOut(status: boolean): void {
      this.isAuthLoggedOut = status;
    },
    async asyncSetIsAuthRegister(name: string, email: string, password: string): Promise<void> {
      try {
        const message = await authApi.postRegister(name, email, password);
        void showSuccessDialog(message);
        this.setIsAuthRegistered(true);
      } catch (error: unknown) {
        void showErrorDialog(getErrorMessage(error, "Gagal melakukan pendaftaran"));
        this.setIsAuthRegistered(false);
      } finally {
        this.setIsAuthRegister(true);
      }
    },
    async asyncSetIsAuthLogin(email: string, password: string): Promise<void> {
      try {
        const result = await authApi.postLogin(email, password);
        apiHelper.putAccessToken(result.token);
        this.setIsAuthLoggedIn(true);
      } catch (error: unknown) {
        void showErrorDialog(getErrorMessage(error, "Gagal login"));
        this.setIsAuthLoggedIn(false);
      } finally {
        this.setIsAuthLogin(true);
      }
    },
    async asyncSetIsAuthLogout(): Promise<void> {
      try {
        await authApi.postLogout();
      } catch {
        // Kegagalan backend diabaikan: token lokal tetap harus dibersihkan.
      } finally {
        apiHelper.putAccessToken(null);
        this.setIsAuthLoggedOut(true);
        this.setIsAuthLogout(true);
      }
    },
  },
});
