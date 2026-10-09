import apiHelper from "../../../helpers/apiHelper";

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface UsersData {
  users?: User[];
}

interface UserData {
  user: User;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

const userApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/users`;

  function _url(path: string): string {
    return BASE_URL + path;
  }

  async function getUsers(): Promise<User[]> {
    const result = await apiHelper.fetchJson<UsersData>(
      _url("/"),
      { method: "GET" },
      "Gagal mengambil data pengguna"
    );

    return result.data.users ?? [];
  }

  async function getProfile(): Promise<User> {
    const result = await apiHelper.fetchJson<UserData>(
      _url("/me"),
      { method: "GET" },
      "Gagal mengambil data profil"
    );

    return result.data.user;
  }

  async function putProfile(name: string, email: string): Promise<string> {
    const result = await apiHelper.fetchJson<unknown>(
      _url("/me"),
      {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify({ name, email }),
      },
      "Gagal mengubah profil"
    );

    return result.message ?? "";
  }

  async function postProfilePhoto(photo: File): Promise<string> {
    const formData = new FormData();
    formData.append("photo", photo, photo.name);

    const result = await apiHelper.fetchJson<unknown>(
      _url("/me/photo"),
      { method: "PUT", body: formData },
      "Gagal mengubah foto profil"
    );

    return result.message ?? "";
  }

  async function putProfilePassword(
    password: string,
    newPassword: string,
    newPasswordConfirmation: string
  ): Promise<string> {
    const result = await apiHelper.fetchJson<unknown>(
      _url("/password"),
      {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          password,
          new_password: newPassword,
          new_password_confirmation: newPasswordConfirmation,
        }),
      },
      "Gagal mengubah kata sandi"
    );

    return result.message ?? "";
  }

  return {
    getUsers,
    getProfile,
    putProfile,
    postProfilePhoto,
    putProfilePassword,
  };
})();

export default userApi;
