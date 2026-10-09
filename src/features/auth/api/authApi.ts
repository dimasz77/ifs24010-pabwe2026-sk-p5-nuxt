import apiHelper from "../../../helpers/apiHelper";

export interface LoginData {
  token: string;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

const authApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/auth`;

  function _url(path: string): string {
    return BASE_URL + path;
  }

  async function postRegister(name: string, email: string, password: string): Promise<string> {
    const result = await apiHelper.fetchJson<unknown>(
      _url("/register"),
      {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ name, email, password }),
      },
      "Gagal melakukan pendaftaran"
    );

    return result.message ?? "";
  }

  async function postLogin(email: string, password: string): Promise<LoginData> {
    const result = await apiHelper.fetchJson<LoginData>(
      _url("/login"),
      {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ email, password }),
      },
      "Gagal login"
    );

    return result.data;
  }

  async function postLogout(): Promise<string> {
    const result = await apiHelper.fetchJson<unknown>(
      _url("/logout"),
      { method: "POST", headers: JSON_HEADERS },
      "Gagal logout"
    );

    return result.message ?? "";
  }

  return {
    postRegister,
    postLogin,
    postLogout,
  };
})();

export default authApi;
