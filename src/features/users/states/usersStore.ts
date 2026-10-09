import { defineStore } from "pinia";
import userApi, { type User } from "../api/userApi";
import { getErrorMessage, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export interface UsersState {
  users: User[];
  profile: User | null;
  isProfile: boolean;
  isChangeProfile: boolean;
  isChangeProfilePhoto: boolean;
  isChangeProfilePassword: boolean;
}

export const useUsersStore = defineStore("users", {
  state: (): UsersState => ({
    users: [],
    profile: null,
    isProfile: false,
    isChangeProfile: false,
    isChangeProfilePhoto: false,
    isChangeProfilePassword: false,
  }),
  actions: {
    setUsers(users: User[]): void {
      this.users = users;
    },
    setProfile(profile: User | null): void {
      this.profile = profile;
    },
    setIsProfile(status: boolean): void {
      this.isProfile = status;
    },
    setIsChangeProfile(status: boolean): void {
      this.isChangeProfile = status;
    },
    setIsChangeProfilePhoto(status: boolean): void {
      this.isChangeProfilePhoto = status;
    },
    setIsChangeProfilePassword(status: boolean): void {
      this.isChangeProfilePassword = status;
    },
    async asyncSetUsers(): Promise<void> {
      try {
        this.setUsers(await userApi.getUsers());
      } catch {
        this.setUsers([]);
      }
    },
    async asyncSetProfile(): Promise<void> {
      try {
        this.setProfile(await userApi.getProfile());
      } catch {
        this.setProfile(null);
      } finally {
        this.setIsProfile(true);
      }
    },
    async asyncPutProfile(name: string, email: string): Promise<void> {
      try {
        const message = await userApi.putProfile(name, email);
        this.setProfile(await userApi.getProfile());
        void showSuccessDialog(message);
        this.setIsChangeProfile(true);
      } catch (error: unknown) {
        void showErrorDialog(getErrorMessage(error, "Gagal mengubah profil"));
        this.setIsChangeProfile(false);
      }
    },
    async asyncPostProfilePhoto(photo: File): Promise<void> {
      try {
        const message = await userApi.postProfilePhoto(photo);
        this.setProfile(await userApi.getProfile());
        void showSuccessDialog(message);
        this.setIsChangeProfilePhoto(true);
      } catch (error: unknown) {
        void showErrorDialog(getErrorMessage(error, "Gagal mengubah foto profil"));
        this.setIsChangeProfilePhoto(false);
      }
    },
    async asyncPutProfilePassword(
      oldPassword: string,
      newPassword: string,
      newPasswordConfirmation: string
    ): Promise<void> {
      try {
        const message = await userApi.putProfilePassword(
          oldPassword,
          newPassword,
          newPasswordConfirmation
        );
        void showSuccessDialog(message);
        this.setIsChangeProfilePassword(true);
      } catch (error: unknown) {
        void showErrorDialog(getErrorMessage(error, "Gagal mengubah kata sandi"));
        this.setIsChangeProfilePassword(false);
      }
    },
  },
});
