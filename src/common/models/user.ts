import { useContext } from 'react';
import { IObservableArray, observable } from 'mobx';
import { Species as ReportSpecies } from 'src/Home/Report/services';
import { z, object } from 'zod';
import {
  DrupalUserModel,
  device,
  useToast,
  useLoader,
  useAlert,
  DrupalUserModelData,
  DrupalUserModelOptions,
} from '@flumens';
import { NavContext } from '@ionic/react';
import CONFIG from 'common/config';
import { mainStore } from './store';

export type Attrs = {
  firstName?: string;
  lastName?: string;
  email?: string;
  /** Drupal returns an empty array when field_training is unset. */
  training?: boolean | [];

  /**
   * @deprecated
   */
  password?: string;
} & DrupalUserModelData;

const defaults: Attrs = {
  firstName: '',
  lastName: '',
  email: '',
  training: false,
};

export class UserModel extends DrupalUserModel<Attrs> {
  static registerSchema = object({
    email: z.string().email('common.required'),
    password: z.string().min(1, 'common.required'),
    firstName: z.string().min(1, 'common.required'),
    lastName: z.string().min(1, 'common.required'),
  });

  userSpeciesReport: IObservableArray<ReportSpecies> = observable([]);

  userSpeciesLastMonthReport: IObservableArray<ReportSpecies> = observable([]);

  constructor(options: DrupalUserModelOptions<Attrs>) {
    super({ ...options, data: { ...defaults, ...options.data } });

    const refreshAccount = () => {
      if (this.isLoggedIn() && device.isOnline) {
        console.log('User: refreshing profile');
        this.refreshProfile().catch(console.error);
      }
    };
    this.ready?.then(refreshAccount);
  }

  async checkActivation() {
    if (!this.isLoggedIn()) return false;

    if (!this.data.verified) {
      try {
        await this.refreshProfile();
      } catch (e) {
        // do nothing
      }

      if (!this.data.verified) return false;
    }

    return true;
  }

  async resendVerificationEmail() {
    if (!this.isLoggedIn() || this.data.verified) return false;

    await this._sendVerificationEmail();

    return true;
  }

  logOut() {
    this.userSpeciesReport.clear();
    this.userSpeciesLastMonthReport.clear();

    return super.logOut();
  }

  getPrettyName = () => {
    if (!this.isLoggedIn()) return '';

    return `${this.data.firstName} ${this.data.lastName}`;
  };

  reset() {
    return super.reset(defaults);
  }
}

console.log('UserModel: initializing');

const userModel = new UserModel({
  cid: 'user',
  store: mainStore,
  config: CONFIG.backend,
});

export const useUserStatusCheck = () => {
  const { navigate } = useContext(NavContext);
  const toast = useToast();
  const loader = useLoader();
  const alert = useAlert();

  const check = async () => {
    if (!device.isOnline) {
      toast.warn('common.sorryLooksLike');
      return false;
    }

    if (!userModel.isLoggedIn()) {
      navigate('/user/login');
      return false;
    }

    if (!userModel.data.verified) {
      await loader.show('common.pleaseWait');
      const isVerified = await userModel.checkActivation();
      loader.hide();

      if (!isVerified) {
        const resendVerificationEmail = async () => {
          await loader.show('common.pleaseWait');
          try {
            await userModel.resendVerificationEmail();
            toast.success('common.newVerificationEmail');
          } catch (error) {
            toast.error(error as Error);
          }
          loader.hide();
        };

        alert({
          header: 'common.looksLikeEmail',
          message: 'common.shouldWeResend',
          buttons: [
            {
              text: 'common.cancel',
              role: 'cancel',
              cssClass: 'secondary',
            },
            {
              text: 'common.resend',
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
