import { useContext } from 'react';
import { observable } from 'mobx';
import { z, object } from 'zod';
import {
  DrupalUserModel,
  device,
  useToast,
  useLoader,
  useAlert,
  DrupalUserModelAttrs,
} from '@flumens';
import { NavContext } from '@ionic/react';
import CONFIG from 'common/config';
import { genericStore } from './store';

export interface Attrs extends DrupalUserModelAttrs {
  firstName?: string;
  lastName?: string;
  email?: string;

  /**
   * @deprecated
   */
  password?: any;
}

const defaults: Attrs = {
  firstName: '',
  lastName: '',
  email: '',
};

export class UserModel extends DrupalUserModel {
  static registerSchema: any = object({
    email: z.string().email('Please fill in'),
    password: z.string().min(1, 'Please fill in'),
    firstName: z.string().min(1, 'Please fill in'),
    lastName: z.string().min(1, 'Please fill in'),
  });

  static resetSchema: any = object({
    email: z.string().email('Please fill in'),
  });

  static loginSchema: any = object({
    email: z.string().email('Please fill in'),
    password: z.string().min(1, 'Please fill in'),
  });

  // eslint-disable-next-line
  // @ts-ignore
  attrs: Attrs = DrupalUserModel.extendAttrs(this.attrs, defaults);

  userSpeciesReport = observable([]) as any;

  userSpeciesLastMonthReport = observable([]) as any;

  constructor(options: any) {
    super(options);

    const checkForValidation = () => {
      if (this.isLoggedIn() && !this.attrs.verified) {
        console.log('User: refreshing profile for validation');
        this.refreshProfile();
      }
    };
    this.ready?.then(checkForValidation);
  }

  async checkActivation() {
    if (!this.isLoggedIn()) return false;

    if (!this.attrs.verified) {
      try {
        await this.refreshProfile();
      } catch (e) {
        // do nothing
      }

      if (!this.attrs.verified) return false;
    }

    return true;
  }

  async resendVerificationEmail() {
    if (!this.isLoggedIn() || this.attrs.verified) return false;

    await this._sendVerificationEmail();

    return true;
  }

  logOut() {
    this.userSpeciesReport.clear();
    this.userSpeciesLastMonthReport.clear();

    return super.logOut();
  }

  // eslint-disable-next-line @getify/proper-arrows/name
  getPrettyName = () => {
    if (!this.isLoggedIn()) return '';

    return `${this.attrs.firstName} ${this.attrs.lastName}`;
  };

  async getAccessToken(...args: any) {
    if (this.attrs.password) await this._migrateAuth();

    return super.getAccessToken(...args);
  }

  /**
   * Migrate from Indicia API auth to JWT. Remove in the future versions.
   */
  async _migrateAuth() {
    console.log('Migrating user auth.');
    if (!this.attrs.email) {
      // email might not exist
      delete this.attrs.password;
      return this.save();
    }

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const tokens = await this._exchangePasswordToTokens(
        this.attrs.email,
        this.attrs.password
      );
      this.attrs.tokens = tokens;
      delete this.attrs.password;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this._refreshAccessToken();
    } catch (e: any) {
      if (e.message === 'Incorrect password or email') {
        console.log('Removing invalid old user credentials');
        delete this.attrs.password;
        this.logOut();
      }
      console.error(e);
      throw e;
    }

    return this.save();
  }

  resetDefaults() {
    return super.resetDefaults(defaults);
  }
}

console.log('UserModel: initializing');

const userModel = new UserModel({
  cid: 'user',
  store: genericStore,
  config: CONFIG.backend,
});

export const useUserStatusCheck = () => {
  const { navigate } = useContext(NavContext);
  const toast = useToast();
  const loader = useLoader();
  const alert = useAlert();

  const check = async () => {
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return false;
    }

    if (!userModel.isLoggedIn()) {
      navigate(`/user/login`);
      return false;
    }

    if (!userModel.attrs.verified) {
      await loader.show('Please wait...');
      const isVerified = await userModel.checkActivation();
      loader.hide();

      if (!isVerified) {
        const resendVerificationEmail = async () => {
          await loader.show('Please wait...');
          try {
            await userModel.resendVerificationEmail();
            toast.success(
              'A new verification email was successfully sent now. If you did not receive the email, then check your Spam or Junk email folders.'
            );
          } catch (err: any) {
            toast.error(err);
          }
          loader.hide();
        };

        alert({
          header: "Looks like your email hasn't been verified yet.",
          message: 'Should we resend the verification email?',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
            },
            {
              text: 'Resend',
              cssClass: 'primary',
              handler: resendVerificationEmail,
            },
          ],
        });

        return false;
      }
    }

    return true;
  };

  return check;
};

export default userModel;
