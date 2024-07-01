import { LoginResponse } from '../entities/login-response';

export interface RomachAuthApiInterface {
  login(clientId: string, clientSecret: string): Promise<LoginResponse>;
}
