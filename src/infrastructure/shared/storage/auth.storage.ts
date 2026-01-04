/**
 * Auth Storage
 * Helper functions para manejar el token de autenticación en localStorage
 */

// eslint-disable-next-line @typescript-eslint/typedef -- Const assertion conflict
const AUTH_TOKEN_KEY = 'auth_token' as const;

/**
 * Save auth token to localStorage
 */
export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error: unknown) {
    console.error('[Auth Storage] Error saving token:', error);
  }
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error: unknown) {
    console.error('[Auth Storage] Error reading token:', error);
    return null;
  }
}

/**
 * Remove auth token from localStorage
 */
export function clearAuthToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error: unknown) {
    console.error('[Auth Storage] Error clearing token:', error);
  }
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  const token: string | null = getAuthToken();
  return token !== null && token.length > 0;
}
