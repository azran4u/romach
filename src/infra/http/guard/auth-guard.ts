import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) {
      // log error
      throw new UnauthorizedException();
    }
    // verify token
    // check for permissions in jwt
    // return true if valid
    return true;
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return null;
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer') return null;
    return token;
  }
}
