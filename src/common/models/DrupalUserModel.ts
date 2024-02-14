// /** ****************************************************************************
//  * User model describing the user model on drupal backend. Persistent.
//  **************************************************************************** */
// eslint-disable-next-line max-classes-per-file
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import {
  string as YupString,
  object as YupObject,
  array as YupArray,
  number as YupNumber,
  AnySchema,
} from 'yup';
import { Model, HandledError } from '@flumens';

type GenericModelAttrs = any;
type GenericModelOptions = any;

/* eslint-disable camelcase */
function setUserFields(attrs: any, data: any) {
  Object.keys(data).forEach(key => {
    if (key.match(/^field_/)) {
      const cammelCaseKey = key
        .replace('field_', '')
        .replace(/_([a-z])/g, g => g[1].toUpperCase());

      if (!data[key]) {
        return;
      }

      // use this for full drupal profile pull
      if (Array.isArray(data[key]) && data[key].length) {
        attrs[cammelCaseKey] = data[key][0].value; // eslint-disable-line
        return;
      }

      attrs[cammelCaseKey] = data[key]; // eslint-disable-line
    }
  });
}

// axios wrapper to pass through server error messages
const parseServerError = (e: AxiosError<{ message?: string }>) => {
  if (e.response && e.response.data && e.response.data.message) {
    if (e.response.data.message.includes('is already taken')) {
      throw new HandledError('This email is already taken.');
    }
    if (e.response.data.message === 'The user credentials were incorrect.') {
      throw new HandledError('Incorrect password or email');
    }
    if (e.response.data.message === 'Unrecognized username or email address.') {
      throw new HandledError('Unrecognized email address.');
    }
    if (e.response.data.message === 'This account is already activated') {
      throw new HandledError('This account is already activated.');
    }
    // catches also one where email is embedded
    if (e.response.data.message.includes('not been activated')) {
      throw new HandledError('The user has not been activated or is blocked.');
    }

    throw new Error(e.response.data.message);
  }

  if (e.message?.includes('timeout')) {
    throw new HandledError('Timeout');
  }

  throw e;
};

const timeout = 60000; // default request timeout in ms

type JWT = JwtPayload & {
  exp: number;
  email: string;
  email_verified: boolean;
  'http://indicia.org.uk/user:id': number;
  scopes?: string[];
};

function hasTokenExpired(accessToken: string) {
  const MAX_TIME_TO_ROUND_TRIP_REQUEST = 2 * 60 * 1000; // give extra 2min to upload large files etc

  if (!accessToken) return true;

  const { exp }: JWT = jwtDecode(accessToken);
  const expiryTime = exp * 1000; // UNIX timestamp

  return Date.now() + MAX_TIME_TO_ROUND_TRIP_REQUEST > expiryTime;
}

export type BackendConfig = {
  /**
   * Site URL without a trailing slash.
   */
  url: string;
  /**
   * Consumer ID.
   */
  clientId: string;
  /**
   * Consumer secret.
   */
  clientPass?: string;
  /**
   * User scopes (roles to fetch).
   */
  scopes?: string[];
};

export interface Attrs extends GenericModelAttrs {
  email?: string;
  verified?: boolean;
  indiciaUserId?: number;
  roles?: string[];
  tokens?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  };
}

const defaults: Attrs = {
  email: '',
  tokens: undefined,
  verified: false,
  indiciaUserId: undefined,
};

export interface Options extends GenericModelOptions {
  /**
   * Drupal site config.
   */
  config: BackendConfig;
}

export default class DrupalUserModel extends Model {
  config: BackendConfig;

  // eslint-disable-next-line
  // @ts-ignore
  attrs: Attrs = Model.extendAttrs(this.attrs, defaults);

  loginSchema: AnySchema = YupObject().shape({
    email: YupString().email().required(),
    password: YupString().required(),
  });

  loginSchemaBackend: AnySchema = YupObject().shape({
    id: YupNumber().required(),
    email: YupString().email().required(),
  });

  resetSchema: AnySchema = YupObject().shape({
    email: YupString().email().required(),
  });

  registerSchema: AnySchema = YupObject().shape({
    email: YupString().email().required(),
    password: YupString().required(),
  });

  registerSchemaBackend: AnySchema = YupObject().shape({
    uid: YupArray().of(YupObject().shape({ value: YupNumber().required() })),
  });

  private _refreshingProfilePromise?: Promise<void>;

  private _refreshingTokenPromise?: Promise<void>;

  constructor({ config, ...options }: Options) {
    super(options);
    this.config = config;
  }

  async logIn(email: string, password: string) {
    console.log('USER: logIn()');

    console.log('USER: logIn() doing _exchangePasswordToTokens');
    const tokens = await this._exchangePasswordToTokens(email, password);
    console.log('USER: logIn() _exchangePasswordToTokens OK');

    this.attrs.tokens = tokens;
    console.log('USER: logIn() refreshProfile');

    await this.refreshProfile();

    return this.save();
  }

  async register(email: string, password: string, otherFields: any) {
    console.log('USER: register()');

    const data = JSON.stringify({
      name: [{ value: email }],
      pass: [{ value: password }],
      mail: [{ value: email }],
      ...otherFields,
    });

    const options: AxiosRequestConfig = {
      method: 'post',
      url: `${this.config.url}/user/register-with-password?_format=json`,
      headers: { 'content-type': 'application/json' },
      data,
      timeout,
    };

    const { data: user } = await axios(options).catch(parseServerError);

    const isValidResponse = await this.registerSchemaBackend.isValid(user);
    if (!isValidResponse) {
      throw new Error('Invalid backend response.');
    }

    const tokens = await this._exchangePasswordToTokens(email, password);
    this.attrs.tokens = tokens;

    this.id = user.uid[0].value;
    this.attrs.email = email;
    setUserFields(this.attrs, user);

    return this.save();
  }

  async reset(email: string) {
    console.log('USER: reset()');

    const data = JSON.stringify({ mail: email });

    const options: AxiosRequestConfig = {
      method: 'post',
      url: `${this.config.url}/user/password?_format=json`,
      headers: { 'content-type': 'application/json' },
      data,
    };

    try {
      await axios(options).catch(parseServerError);
    } catch (e: any) {
      if (e.message === 'The user has not been activated or is blocked.') {
        await this._sendVerificationEmail(email);
        return;
      }

      parseServerError(e);
    }
  }

  async delete() {
    console.log('USER: delete()');

    const token = await this.getAccessToken(true); // force refresh because if unsuccessful it will invalidate the current token

    const options: AxiosRequestConfig = {
      method: 'delete',
      url: `${this.config.url}/user/${this.id}?_format=json`,
      headers: { Authorization: `Bearer ${token}` },
    };

    await axios(options).catch(parseServerError);

    this.logOut();
  }

  /**
   * Gets full user profile inc. fresh new tokens.
   */
  async refreshProfile() {
    console.log('USER: refreshProfile()');

    if (this._refreshingProfilePromise) {
      console.log('USER: refreshProfile() _refreshingProfilePromise already');

      return this._refreshingProfilePromise;
    }

    this._refreshingProfilePromise = Promise.resolve()
      .then(async () => {
        console.log('USER: refreshProfile() getting access token');

        const token = await this.getAccessToken(true);
        console.log('USER: refreshProfile() getting access done');

        if (this.attrs.verified) {
          console.log('USER: refreshProfile() verified');

          const options = {
            url: `${this.config.url}/user/${this.id}?_format=json`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout,
          };
          console.log('USER: refreshProfile() request for user profile');

          const { data } = await axios(options).catch(parseServerError);
          console.log('USER: refreshProfile() request for user profile done');

          console.log('USER: refreshProfile() setting email');
          this.attrs.email = data.mail[0].value;
          console.log('USER: refreshProfile() setting fields');

          setUserFields(this.attrs, data);
          console.log('USER: refreshProfile() done');
        }

        await this.save();

        delete this._refreshingProfilePromise;
      })
      .catch(e => {
        console.log(
          'USER: refreshProfile() error deleting _refreshingProfilePromise'
        );

        delete this._refreshingProfilePromise;
        throw e;
      });

    return this._refreshingProfilePromise;
  }

  /**
   * @deprecated The method should not be used. Use isLoggedIn instead.
   */
  hasLogIn() {
    console.warn('hasLogIn is deprecated, please use isLoggedIn instead.');
    return this.isLoggedIn();
  }

  isLoggedIn() {
    console.log('USER: isLoggedIn()', !!this.id);

    // eslint-disable-next-line no-unused-expressions
    this.attrs.email; // force read the observable to make this function reactive
    return !!this.id;
  }

  async logOut() {
    console.log('USER: logOut()');

    return this.resetDefaults();
  }

  resetDefaults(defaultsToSet?: any) {
    console.log('USER: resetDefaults()');

    return super.resetDefaults({ ...defaults, ...defaultsToSet });
  }

  async getAccessToken(forceRefresh?: boolean) {
    console.log('USER: getAccessToken()');

    if (!forceRefresh && !this.isLoggedIn())
      throw new Error('User is not logged in.');

    const { access_token } = this.attrs.tokens || {};

    const hasExpired = hasTokenExpired(access_token as string);
    const needRefresh = !access_token || hasExpired || forceRefresh;
    if (needRefresh) {
      console.log(
        'USER: getAccessToken() needRefresh',
        !access_token,
        hasExpired,
        forceRefresh
      );

      try {
        console.log('USER: getAccessToken() about to do _refreshAccessToken');

        await this._refreshAccessToken();
        console.log('USER: getAccessToken() _refreshAccessToken done');
      } catch (error: any) {
        const hasInvalidRefreshToken =
          error.message === 'The refresh token is invalid.';
        const userWasDeleted = error.message === 'Token has no user email.';

        console.log(
          'USER: getAccessToken() error',
          hasInvalidRefreshToken,
          userWasDeleted
        );

        console.error(error);

        if (hasInvalidRefreshToken || userWasDeleted) {
          console.log(
            'USER: getAccessToken() error',
            hasInvalidRefreshToken,
            userWasDeleted
          );

          await this.logOut(); // force log out
          throw new Error('User re-login is required.');
        }

        throw error;
      }
    }
    console.log('USER: getAccessToken() returning token');

    return this.attrs.tokens?.access_token;
  }

  protected async _sendVerificationEmail(email?: string) {
    const data = JSON.stringify({
      mail: [{ value: email || this.attrs.email }],
    });

    const options: AxiosRequestConfig = {
      method: 'post',
      url: `${this.config.url}/user/register-with-password?_format=json&resendVerificationEmail=true`,
      headers: { 'content-type': 'application/json' },
      data,
      timeout,
    };

    return axios(options).catch(parseServerError);
  }

  private async _exchangePasswordToTokens(email: string, password: string) {
    const formdata = new FormData();
    formdata.append('grant_type', 'password');
    formdata.append('username', email);
    formdata.append('password', password);
    formdata.append('client_id', this.config.clientId);
    this.config.clientPass &&
      formdata.append('client_secret', this.config.clientPass);
    this.config.scopes?.length &&
      formdata.append('scope', this.config.scopes.join(' ')); // key name is singular

    const options: AxiosRequestConfig = {
      method: 'post',
      url: `${this.config.url}/oauth/token`,
      data: formdata,
    };
    console.log('USER: _exchangePasswordToTokens() about to do request');

    const { data } = await axios(options).catch(parseServerError);
    console.log('USER: _exchangePasswordToTokens() request done');

    return data;
  }

  private async _refreshAccessToken() {
    console.log('USER: _refreshAccessToken()');

    if (this._refreshingTokenPromise) {
      console.log('USER: _refreshAccessToken() _refreshingTokenPromise exists');

      return this._refreshingTokenPromise;
    }

    this._refreshingTokenPromise = Promise.resolve()
      .then(async () => {
        const { refresh_token } = this.attrs.tokens || {};
        if (!refresh_token) {
          throw new Error('No user session refresh token was found');
        }

        const formdata = new FormData();
        formdata.append('grant_type', 'refresh_token');
        formdata.append('refresh_token', refresh_token);
        formdata.append('client_id', this.config.clientId);
        this.config.clientPass &&
          formdata.append('client_secret', this.config.clientPass);

        const options: AxiosRequestConfig = {
          method: 'post',
          url: `${this.config.url}/oauth/token`,
          data: formdata,
          timeout,
        };
        console.log('USER: _refreshAccessToken() about to do request');

        const { data: newTokens } = await axios(options).catch(
          parseServerError
        );
        console.log('USER: _refreshAccessToken() request done');

        this.attrs.tokens = { ...this.attrs.tokens, ...newTokens };
        console.log('USER: _refreshAccessToken() set new tokens');

        const decodedAccessToken: JWT = jwtDecode(
          this.attrs.tokens?.access_token as string
        );
        console.log('USER: _refreshAccessToken() setting new id');

        this.id = decodedAccessToken.sub;
        console.log('USER: _refreshAccessToken() setting new email');

        this.attrs.email = decodedAccessToken.email;
        if (!this.attrs.email) {
          // can happen if user account was deleted and token refreshed
          throw new Error('Token has no user email.');
        }

        this.attrs.verified = decodedAccessToken.email_verified;
        this.attrs.indiciaUserId =
          decodedAccessToken['http://indicia.org.uk/user:id'];
        if (decodedAccessToken.scopes) {
          this.attrs.roles = decodedAccessToken.scopes;
        }
        console.log('USER: _refreshAccessToken() setting other fields');

        setUserFields(this.attrs, decodedAccessToken);
        console.log('USER: _refreshAccessToken() done');

        await this.save();

        delete this._refreshingTokenPromise;
      })
      .catch(e => {
        console.error('USER: _refreshAccessToken() error', e.message);

        delete this._refreshingTokenPromise;
        throw e;
      });

    return this._refreshingTokenPromise;
  }
}
