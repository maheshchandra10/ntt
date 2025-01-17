import { PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "../utils/auth";
import { Auth0Client } from "@auth0/auth0-spa-js";

export type EnvironmentReducerState = {
  readonly api: string | undefined;
  readonly ws: string | undefined;
  readonly noauth: boolean; // is authorization disabled
  /**
   * Indicates if auth was attempted. This is here because of react strict mode
   * that renders things twice to mess with your life and elicit your errors.
   */
  readonly authStarted: boolean;
  /**
   * undefined => do not know yet - haven't hit server, auth not attmepted
   * false => not authorized
   * true => auth succeeded
  */
  readonly auth?: boolean;
  readonly authClient?: Auth0Client;
  readonly authConfig?: any;
  readonly deviceCode?: any;
  readonly deviceCodeToken?: string;
};

const initialState: EnvironmentReducerState = {
  api: undefined,
  ws: undefined,
  noauth: false,
  authStarted: false,
}

export const EnvironmentReducer = (state = initialState, action: PayloadAction) => {
	switch(action.type) {
		case 'environment/config': {
			if (action.payload != null && ('data' in action.payload)) {
				if ('API_URL' in action.payload['data'] && 'WS_URL' in action.payload['data']) {
					return {...state, api: action.payload['data']['API_URL'], ws: action.payload['data']['WS_URL']}
				} else {
          console.error(`environment/config payload missing API_URL or WS_URL`);
        }
			}
			return state;
		}
    case 'environment/authstarted': {
      if (action.payload === null || action.payload === undefined) return state;
      const started: boolean = (action.payload as unknown) as boolean;
      return { ...state, authStarted: started};
    }
    case 'environment/authconfig': {
      if (action.payload === null || action.payload === undefined) return state;
      const authState: AuthState = (action.payload as unknown) as AuthState;

      return {...state, auth: authState.auth, noauth: authState.noauth, authConfig: authState.config};
    }
    case 'environment/authenticate': {
      if (action.payload === null || action.payload === undefined) return state;
      const authState: AuthState = (action.payload as unknown) as AuthState;
      return {...state, auth: authState.auth, noauth: authState.noauth};
    }
    case 'environment/authclient': {
      if (action.payload === null || action.payload === undefined) return state;
      const client: Auth0Client = (action.payload as unknown) as Auth0Client;
      return { ...state, authClient: client};
    }
    case 'environment/devicecode': {
      return {...state, deviceCode: action.payload};
    }
    case 'environment/devicecodepoll': {
      if (action.payload === undefined || action.payload === null) return state;
      const authResult: any = (action.payload as unknown) as any;
      if (!Object.prototype.hasOwnProperty.call(authResult, 'access_token')) return state;
      return {...state, auth: true, deviceCode: undefined, deviceCodeToken: authResult.access_token};
    }
		default:
			return state;
	}
}