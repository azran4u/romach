export interface LoginResponse {
  success: boolean;
  tokenSet: {
    accessToken: string;
    refreshToken: string;
  };
}
