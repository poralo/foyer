import { LogLevel, PassedInitialConfig } from 'angular-auth-oidc-client';
import { environment } from 'environments/environment';

export const authConfig: PassedInitialConfig = {
  config: {
    authority: 'https://dev-alc7phtdtubuht7o.us.auth0.com',
    redirectUrl: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    clientId: 'bQCH3GMXn7dtwz0DLYcuiw5MW43zdzrW',
    scope: 'openid profile offline_access',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: 30,
    logLevel: environment.production ? LogLevel.None : LogLevel.Debug,
    secureRoutes: [environment.apiURL],
    customParamsAuthRequest: {
      audience: 'https://dev-alc7phtdtubuht7o.us.auth0.com/api/v2/',
    },
    customParamsRefreshTokenRequest: {
      scope: 'openid profile offline_access',
    },
  },
};
