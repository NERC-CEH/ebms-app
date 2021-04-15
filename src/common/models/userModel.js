/** ****************************************************************************
 * User model describing the user model on backend. Persistent.
 **************************************************************************** */
import Log from 'helpers/log';
import { Model } from '@apps';
import axios from 'axios';
import * as Yup from 'yup';
import CONFIG from 'config';
import { genericStore } from './store';

class UserModel extends Model {
  loginSchema = Yup.object().shape({
    email: Yup.string().required(),
    password: Yup.string().required(),
  });

  loginSchemaBackend = Yup.object().shape({
    id: Yup.number().required(),
    email: Yup.string().email().required(),
    name: Yup.string().required(),
  });

  resetSchema = Yup.object().shape({
    name: Yup.string().required(),
  });

  resetSchemaBackend = Yup.object().shape({
    data: Yup.object().shape({
      id: Yup.number().required(),
      firstname: Yup.string().required(),
      secondname: Yup.string().required(),
      type: Yup.string().required(),
    }),
  });

  registerSchema = Yup.object().shape({
    email: Yup.string().email('email is not valid').required(),
    firstname: Yup.string().required(),
    secondname: Yup.string().required(),
    password: Yup.string().required(),
  });

  registerSchemaBackend = Yup.object().shape({
    id: Yup.number().required(),
    warehouse_id: Yup.number().required(),
    email: Yup.string().email().required(),
    name: Yup.string().required(),
    firstname: Yup.string().required(),
    secondname: Yup.string().required(),
  });

  async logOut() {
    return this.resetDefaults();
  }

  async logIn(details) {
    Log('User: logging in.');

    const userAuth = btoa(`${details.name}:${details.password}`);
    const url = `${CONFIG.backend.url}/api/v1/users/${encodeURIComponent(
      details.name
    )}`;
    const options = {
      headers: {
        authorization: `Basic ${userAuth}`,
        'x-api-key': CONFIG.backend.apiKey,
        'content-type': 'application/json',
      },
    };

    let res;
    try {
      res = await axios(url, options);
      res = res.data;
      const isValidResponse = await this.loginSchemaBackend.isValid(res.data);
      if (!isValidResponse) {
        throw new Error('Invalid backend response.');
      }
    } catch (e) {
      throw new Error(t(e.message));
    }

    const user = { ...res.data, ...{ password: details.password } };
    this._logIn(user);
  }

  async register(details) {
    Log('User: registering.');
    const userAuth = btoa(`${details.name}:${details.password}`);
    const options = {
      method: 'post',
      headers: {
        authorization: `Basic ${userAuth}`,
        'x-api-key': CONFIG.backend.apiKey,
        'content-type': 'plain/text',
      },
      data: { data: details },
    };

    let res;
    try {
      const url = `${CONFIG.backend.url}/api/v1/users`;
      res = await axios(url, options);
      res = res.data;
      const isValidResponse = await this.registerSchemaBackend.isValid(res);
      if (!isValidResponse) {
        throw new Error('Invalid backend response.');
      }
    } catch (e) {
      throw new Error(t(e.message));
    }

    const user = { ...res, ...{ password: details.password } };
    this._logIn(user);
  }

  async reset(details) {
    Log('User: resetting.');

    const options = {
      method: 'put',
      headers: {
        'x-api-key': CONFIG.backend.apiKey,
        'content-type': 'plain/text',
      },
      data: {
        data: {
          type: 'users',
          password: ' ', // reset password
        },
      },
    };

    let res;
    try {
      const url = `${CONFIG.backend.url}/api/v1/users/${encodeURIComponent(
        details.name
      )}`;
      res = await axios(url, options);
      res = res.data;

      const isValidResponse = await this.resetSchemaBackend.isValid(res);
      if (!isValidResponse) {
        throw new Error('Invalid backend response.');
      }
    } catch (e) {
      throw new Error(t(e.message));
    }
  }

  _logIn(user) {
    Log('UserModel: logging in.');

    this.attrs.drupalID = user.id || '';
    this.attrs.password = user.password || '';
    this.attrs.email = user.email || '';
    this.attrs.name = user.name || '';
    this.attrs.firstname = user.firstname || '';
    this.attrs.secondname = user.secondname || '';
    this.attrs.isLoggedIn = true;

    return this.save();
  }

  hasLogIn() {
    return !!this.attrs.email;
  }

  getUser() {
    return this.attrs.email;
  }

  getPassword() {
    return this.attrs.password;
  }
}

const defaults = {
  isLoggedIn: false,
  drupalID: null,
  name: null,
  firstname: null,
  secondname: null,
  email: null,
  password: null,
};

const userModel = new UserModel(genericStore, 'user', defaults);
export { userModel as default, UserModel };
