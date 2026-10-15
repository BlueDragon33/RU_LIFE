/** Types for the local Cloudflare browser SSO client. */
export interface RuLifeManagedSsoEnv {
  RU_LIFE_ACCESS_MODE?: string;
  RU_LIFE_SSO_ENABLED?: string;
  RU_LIFE_SSO_CALLBACK_URL?: string;
  RU_LIFE_SSO_SESSION_KEY?: string;
}
export declare function managedSsoEnabled(env: RuLifeManagedSsoEnv): boolean;
export declare function hasManagedSsoSession(request: Request, env: RuLifeManagedSsoEnv): Promise<boolean>;
export declare function handleManagedSso(request: Request, env: RuLifeManagedSsoEnv): Promise<Response | null>;
export declare function requiresManagedBrowserSso(pathname: string): boolean;
