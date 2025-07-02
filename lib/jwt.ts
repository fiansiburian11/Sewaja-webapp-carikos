export interface JwtPayload {
  id: string;
  email: string;
  exp: number;
  iat?: number;
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.id,
      email: payload.email,
      exp: payload.exp,
      iat: payload.iat,
    };
  } catch {
    return null;
  }
}
