import React from 'react';
// import PropTypes from 'prop-types';
// import Log from 'helpers/log';
// import Device from 'helpers/device';
// import CONFIG from 'config';
import { IonContent, IonIcon, IonPopover } from '@ionic/react';
import AppHeader from 'common/Components/Header';
import './styles.scss';

// /**
//  * Starts an app sign in to the Drupal site process.
//  * The sign in endpoint is specified by CONFIG.login.url -
//  * should be a Drupal sight using iForm Mobile Auth Module.
//  *
//  * It is important that the app authorises itself providing
//  * api_key for the mentioned module.
//  */
// function login(details, userModel) {
//   Log('User:Login: logging in.');
//   const promise = new Promise((fulfill, reject) => {
//     const userAuth = btoa(`${details.name}:${details.password}`);
//     $.ajax({
//       method: 'get',
//       url: CONFIG.users.url + encodeURIComponent(details.name), // url + user id
//       timeout: CONFIG.users.timeout,
//       headers: {
//         authorization: `Basic ${userAuth}`,
//         'x-api-key': CONFIG.indicia.api_key,
//         'content-type': 'application/json',
//       },
//       success(receivedData) {
//         const data = receivedData.data || {};
//         if (!data.id || !data.email || !data.name) {
//           const err = new Error('Error while retrieving login response.');
//           reject(err);
//           return;
//         }

//         const fullData = _.extend(data, { password: details.password });
//         userModel.logIn(fullData);
//         fulfill(fullData);
//       },
//       error(xhr, textStatus, errorThrown) {
//         let message = errorThrown;
//         if (xhr.responseJSON && xhr.responseJSON.errors) {
//           message = xhr.responseJSON.errors.reduce(
//             (name, err) => `${name}${err.title}\n`,
//             ''
//           );
//         }
//         reject(new Error(message));
//       },
//     });
//   });

//   return promise;
// }

// function validateForm(attrs) {
//   const errors = {};

//   if (!attrs.name) {
//     errors.name = t("can't be blank");
//   }

//   if (!attrs.password) {
//     errors.password = t("can't be blank");
//   }

//   if (!_.isEmpty(errors)) {
//     return errors;
//   }

//   return null;
// }

class Component extends React.Component {
  state = { showPopover: false };

  constructor(props) {
    super(props);
    this.userName = React.createRef();
    this.userPassword = React.createRef();
  }

  updateInputValidation(validation) {
    this.setState({
      userNameError: validation.name,
      userPasswordError: validation.password,
    });
  }

  // onClick() {
  //   const { userModel } = this.props;

  //   if (!Device.isOnline()) {
  //     radio.trigger('app:dialog', {
  //       title: 'Sorry',
  //       body: 'Looks like you are offline!',
  //     });
  //     return;
  //   }

  //   const name = this.userName.current.value;
  //   const password = this.userPassword.current.value;

  //   const data = {
  //     name: name.trim(),
  //     password,
  //   };

  //   const validationError = validateForm(data);
  //   this.updateInputValidation(validationError || {});
  //   if (validationError) {
  //     return;
  //   }

  //   // mainView.triggerMethod('form:data:invalid', {}); // update form
  //   radio.trigger('app:loader');
  //   login(data, userModel)
  //     .then(() => {
  //       radio.trigger('app:loader:hide');
  //       this.props.onSuccess && this.props.onSuccess();
  //       window.history.back();
  //     })
  //     .catch(err => {
  //       Log(err, 'e');
  //       radio.trigger('app:dialog:error', err);
  //     });
  // }

  setShowPopover = val => {
    this.setState({ showPopover: val });
  };

  render() {
    const ToDoPopover = (
      <IonPopover
        isOpen={this.state.showPopover}
        onDidDismiss={() => {
          this.setShowPopover(false);
        }}
      >
        <small style={{ padding: '30px' }}>
          <center>TODO: implement</center>
        </small>
      </IonPopover>
    );

    return (
      <>
        {ToDoPopover}
        <AppHeader title={t('Login')} />
        <IonContent>
          <div className="info-message">
            <p>{t('Please sign in with your eBMS account or register.')}</p>
          </div>

          <ion-list lines="full">
            <ion-item error={this.state.userNameError}>
              <IonIcon name="person" faint size="small" slot="start" />
              <ion-input
                ref={this.userName}
                required
                type="text"
                placeholder={t('Username or email')}
              />
            </ion-item>
            <ion-item error={this.state.userPasswordError}>
              <IonIcon name="key" faint size="small" slot="start" />
              <ion-input
                ref={this.userPassword}
                required
                type="password"
                placeholder={t('Password')}
              />
            </ion-item>
          </ion-list>

          <ion-list class="login-buttons">
            <ion-button
              onClick={() => this.setShowPopover(true)}
              // onClick={this.onClick}
              expand="full"
              color="primary"
            >
              {t('Sign in')}
            </ion-button>

            <ion-button href="#user/register" expand="full" color="light">
              {t('Register')}
            </ion-button>

            <ion-button href="#user/reset" expand="full" color="light">
              {t('Forgot password?')}
            </ion-button>
          </ion-list>
        </IonContent>
      </>
    );
  }
}

Component.propTypes = {
  // onSuccess: PropTypes.func,
  // userModel: PropTypes.object.isRequired,
};

export default Component;
