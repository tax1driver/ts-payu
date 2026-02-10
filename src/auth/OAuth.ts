import axios, { AxiosInstance, AxiosError } from "axios";
import { AuthenticationResponse } from "./Authentication";
import { AuthorizeEndpoint } from "../endpoints";
import { AuthenticationErrorResponse } from "./AuthenticationErrorResponse";
import { AuthenticationError } from "../errors/AuthenticationError";

export class OAuth {
  private accessToken: string;
  private expiry: Date;

  /**
   *Creates an instance of OAuth.
   * @param {AxiosInstance} client - configured axios client for proper backend
   * @param {number} clientId - client id
   * @param {string} clientSecret - client secret
   * @memberof OAuth
   */
  constructor(
    private readonly client: AxiosInstance,
    private readonly clientId: number,
    private readonly clientSecret: string
  ) {
    // initialize the authenticater to have invalidated expiry date
    // so it will fetch new one on first try
    this.expiry = new Date(Date.now() - 60000);
    this.accessToken = "";
  }

  private async _fetchAccessToken(): Promise<AuthenticationResponse> {
    const data = {
      grant_type: "client_credentials",
      client_id: this.clientId.toString(),
      client_secret: this.clientSecret,
    };

    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    try {
      const response = await this.client.post(
        AuthorizeEndpoint,
        new URLSearchParams(data).toString(),
        config
      );
      const auth = <AuthenticationResponse>response.data;
      return auth;
    } catch (error) {
      this.accessToken = "";
      this.expiry = new Date(Date.now() - 60000);

      const errors = error as Error | AxiosError;

      if (axios.isAxiosError(errors)) {
        const errResponse = <AuthenticationErrorResponse>errors?.response?.data;
        throw new AuthenticationError(
          errResponse.error,
          errResponse.error_description
        );
      }

      throw error;
    }
  }

  /**
   * Get access token from PayU service
   *
   * @returns {Promise<string>} - access token
   * @throws {AuthenticationError}
   * @memberof Auth
   */
  public async getAccessToken(): Promise<string> {
    // valid token(valid for 99%)
    if (Date.now() < this.expiry.getTime() && this.accessToken !== "") {
      return this.accessToken;
    }

    const token = await this._fetchAccessToken();
    this.accessToken = token.access_token;
    this.expiry = new Date(Date.now() + token.expires_in * 1000);

    return this.accessToken;
  }
}
