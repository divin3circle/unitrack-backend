export interface SignupData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  subscriptionStatus: string;
  currencyCode: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserResponse;
}
