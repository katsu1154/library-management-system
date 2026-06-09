import {
  Configuration,
  PublicClientApplication,
  LogLevel,
  InteractionRequiredAuthError,
  BrowserAuthError,
} from '@azure/msal-browser';

const MICROSOFT_CLIENT_ID = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID ?? '';

export const msalConfig: Configuration = {
  auth: {
    clientId: MICROSOFT_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri:
      typeof window !== 'undefined'
        ? `${window.location.origin}/login`
        : 'http://localhost:3000/login',
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message) => {
        if (level === LogLevel.Error) console.error('[MSAL]', message);
      },
      logLevel: LogLevel.Error,
    },
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
};

let msalInstance: PublicClientApplication | null = null;
let initPromise: Promise<PublicClientApplication> | null = null;

export async function getMsalInstance(): Promise<PublicClientApplication> {
  if (msalInstance) return msalInstance;

  if (!initPromise) {
    initPromise = (async () => {
      const instance = new PublicClientApplication(msalConfig);
      await instance.initialize();
      
      msalInstance = instance;
      return instance;
    })();
  }
  return initPromise;
}

export function isInteractionInProgressError(e: unknown): boolean {
  if (e instanceof BrowserAuthError) {
    return e.errorCode === 'interaction_in_progress';
  }
  if (e instanceof Error) {
    return e.message.includes('interaction_in_progress');
  }
  return false;
}

export { InteractionRequiredAuthError };