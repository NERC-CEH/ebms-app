/** ****************************************************************************
 * User model describing the user model on backend. Persistent.
 **************************************************************************** */
import Log from 'helpers/log';
import CONFIG from 'config';
import { DrupalUserModel, loader, toast } from '@apps';
import axios from 'axios';
import * as Yup from 'yup';
import i18n from 'i18next';
import { genericStore } from './store';

const { warn, error, success } = toast;

let requestCancelToken;

const fetchMothTraps = async token => {
  if (requestCancelToken) {
    requestCancelToken.cancel();
  }

  requestCancelToken = axios.CancelToken.source();

  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/locations`;

  const options = {
    params: {
      location_type_id: 18879,
      public: false,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cancelToken: requestCancelToken.token,
    timeout: 80000,
  };

  let res;

  try {
    res = await axios.get(url, options);
  } catch (e) {
    if (axios.isCancel(e)) {
      return null;
    }

    throw e;
  }

  const flattenData = mothtrap => {
    const { lat: latitude, lon: longitude, ...rest } = mothtrap.values;

    return {
      ...rest,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
  };

  return res.data.map(flattenData);
};

class UserModel extends DrupalUserModel {
  registerSchema = Yup.object().shape({
    email: Yup.string().email('email is not valid').required('Please fill in'),
    password: Yup.string().required('Please fill in'),
    firstName: Yup.string().required('Please fill in'),
    secondName: Yup.string().required('Please fill in'),
  });

  resetSchema = Yup.object().shape({
    email: Yup.string().email('email is not valid').required('Please fill in'),
  });

  loginSchema = Yup.object().shape({
    email: Yup.string().email('email is not valid').required('Please fill in'),
    password: Yup.string().required('Please fill in'),
  });

  hasLogIn() {
    return !!this.attrs.email;
  }

  async checkActivation() {
    const isLoggedIn = !!this.attrs.id;
    if (!isLoggedIn) {
      warn(i18n.t('Please log in first.'));
      return false;
    }

    if (!this.attrs.verified) {
      await loader.show({
        message: i18n.t('Please wait...'),
      });

      try {
        await this.refreshProfile();
      } catch (e) {
        // do nothing
      }

      loader.hide();

      if (!this.attrs.verified) {
        warn(i18n.t('The user has not been activated or is blocked.'));
        return false;
      }
    }

    return true;
  }

  async resendVerificationEmail() {
    const isLoggedIn = !!this.attrs.id;
    if (!isLoggedIn) {
      warn(i18n.t('Please log in first.'));
      return false;
    }

    if (this.attrs.verified) {
      warn(i18n.t('You are already verified.'));
      return false;
    }

    await loader.show({
      message: i18n.t('Please wait...'),
    });

    try {
      await super.resendVerificationEmail();
      success(
        i18n.t(
          'A new verification email was successfully sent now. If you did not receive the email, then check your Spam or Junk email folders.'
        ),
        5000
      );
    } catch (e) {
      error(e);
    }

    loader.hide();

    return true;
  }

  getPrettyName = () => {
    if (!this.hasLogIn()) return '';

    return `${this.attrs.firstName} ${this.attrs.lastName}`;
  };

  async getAccessToken(...args) {
    if (this.attrs.password) await this._migrateAuth();

    return super.getAccessToken(...args);
  }

  /**
   * Migrate from Indicia API auth to JWT. Remove in the future versions.
   */
  async _migrateAuth() {
    console.log('Migrating user auth.');

    const tokens = await this._exchangePasswordToTokens(
      this.attrs.email,
      this.attrs.password
    );
    this.attrs.tokens = tokens;
    delete this.attrs.password;

    await this._refreshAccessToken();
    return this.save();
  }

  async refreshMothTraps() {
    const token = await this.getAccessToken();
    const mothTraps = await fetchMothTraps(token);

    if (!mothTraps) return;

    this.attrs.mothTraps = mothTraps;
    this.save();
  }
}

const defaults = {
  firstName: '',
  lastName: '',

  mothTraps: [],
};

Log('UserModel: initializing');
const userModel = new UserModel(genericStore, 'user', defaults, CONFIG.backend);
export { userModel as default, UserModel };
