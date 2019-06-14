/** ****************************************************************************
 * User model describing the user model on backend. Persistent.
 **************************************************************************** */
import Analytics from 'helpers/analytics';
import Log from 'helpers/log';
import { observable, set as setMobXAttrs } from 'mobx';
import { getStore } from 'common/store';
import makeRequest from 'common/helpers/makeRequest';
import * as Yup from 'yup';
import CONFIG from 'config';

const getDefaultAttrs = () => ({
  isLoggedIn: false,
  drupalID: null,
  name: null,
  firstname: null,
  secondname: null,
  email: null,
  password: null,
});

class UserModel {
  @observable attrs = getDefaultAttrs();

  loginSchema = Yup.object().shape({
    name: Yup.string().required(),
    password: Yup.string().required(),
  });

  loginSchemaBackend = Yup.object().shape({
    id: Yup.number().required(),
    email: Yup.string()
      .email()
      .required(),
    name: Yup.string().required(),
  });

  registerSchema = Yup.object().shape({
    email: Yup.string()
      .email()
      .required(),
    firstname: Yup.string().required(),
    secondname: Yup.string().required(),
    password: Yup.string().required(),
    terms: Yup.boolean()
      .oneOf([true], 'must accept terms and conditions')
      .required(),
  });

  registerSchemaBackend = Yup.object().shape({
    id: Yup.number().required(),
    warehouse_id: Yup.number().required(),
    email: Yup.string()
      .email()
      .required(),
    name: Yup.string().required(),
    firstname: Yup.string().required(),
    secondname: Yup.string().required(),
  });

  constructor() {
    Log('UserModel: initializing');

    this._init = getStore()
      .then(store => store.getItem('user'))
      .then(userStr => {
        const user = JSON.parse(userStr);
        if (!user) {
          Log('UserModel: persisting for the first time');
          this._initDone = true;
          this.save();
          return;
        }

        setMobXAttrs(this.attrs, user.attrs);
        this._initDone = true;
      });
  }

  get(name) {
    return this.attrs[name];
  }

  set(name, value) {
    this.attrs[name] = value;
    return this;
  }

  save() {
    if (!this._initDone) {
      throw new Error(`User Model can't be saved before initialisation`);
    }
    const userStr = JSON.stringify({
      attrs: this.attrs,
    });
    return getStore().then(store => store.setItem('user', userStr));
  }

  /**
   * Resets the user login information.
   */
  logOut() {
    setMobXAttrs(this.attrs, getDefaultAttrs());
    return this.save();
  }

  async logIn(details) {
    Log('User: logging in.');

    const userAuth = btoa(`${details.name}:${details.password}`);
    const url = CONFIG.users.url + encodeURIComponent(details.name);
    const options = {
      headers: {
        authorization: `Basic ${userAuth}`,
        'x-api-key': CONFIG.indicia.api_key,
        'content-type': 'application/json',
      },
    };

    let res;
    try {
      res = await makeRequest(url, options, CONFIG.users.timeout);
      const isValidResponse = await this.loginSchemaBackend.isValid(res.data);
      if (!isValidResponse) {
        throw new Error('invalid backend response.');
      }
    } catch (e) {
      throw new Error(`${t('Login error:')} ${t(e.message)}`);
    }

    const user = { ...res.data, ...{ password: details.password } };
    this._logIn(user);
  }

  async register(details) {
    Log('User: registering.');
    const userAuth = btoa(`${details.name}:${details.password}`);
    const options = {
      method: 'post',
      mode: 'cors',
      headers: {
        authorization: `Basic ${userAuth}`,
        'x-api-key': CONFIG.indicia.api_key,
        'content-type': 'plain/text',
      },
      body: JSON.stringify({ data: details }),
    };

    let res;
    try {
      res = await makeRequest(CONFIG.users.url, options, CONFIG.users.timeout);
      const isValidResponse = await this.registerSchemaBackend.isValid(res);
      if (!isValidResponse) {
        throw new Error('invalid backend response.');
      }
    } catch (e) {
      throw new Error(`${t('Registration error:')} ${t(e.message)}`);
    }

    const user = { ...res, ...{ password: details.password } };
    this._logIn(user);
  }

  _logIn(user) {
    Log('UserModel: logging in.');

    this.set('drupalID', user.id || '');
    this.set('password', user.password || '');
    this.set('email', user.email || '');
    this.set('name', user.name || '');
    this.set('firstname', user.firstname || '');
    this.set('secondname', user.secondname || '');
    this.set('isLoggedIn', true);

    Analytics.trackEvent('User', 'login');

    return this.save();
  }

  /**
   * Returns user contact information.
   */
  hasLogIn() {
    return this.attrs.isLoggedIn;
  }

  getUser() {
    return this.get('email');
  }

  getPassword() {
    return this.get('password');
  }

  resetDefaults() {
    return this.logOut();
  }
}

const userModel = new UserModel();
export { userModel as default, UserModel };
