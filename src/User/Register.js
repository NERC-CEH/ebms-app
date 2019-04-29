import React from 'react';
// import PropTypes from 'prop-types';
import Toggle from 'common/Components/Toggle';
import { IonContent, IonIcon, IonPopover } from '@ionic/react';
import AppHeader from 'common/Components/Header';

// /**
//  * Starts an app sign in to the Drupal site process.
//  * The sign in endpoint is specified by CONFIG.login.url -
//  * should be a Drupal sight using iForm Mobile Auth Module.
//  *
//  * It is important that the app authorises itself providing
//  * api_key for the mentioned module.
//  */
// function register(formData, userModel) {
//   Log('User:Register: registering.');

//   // app logins
//   const promise = new Promise((fulfill, reject) => {
//     const submissionData = Object.assign({}, formData, { type: 'users' });

//     $.ajax({
//       url: CONFIG.users.url,
//       method: 'POST',
//       processData: false,
//       data: JSON.stringify({ data: submissionData }),
//       headers: {
//         'x-api-key': CONFIG.indicia.api_key,
//         'content-type': 'application/json',
//       },
//       timeout: CONFIG.users.timeout,
//       success(receivedData) {
//         const data = receivedData.data || {};
//         if (
//           !data.id ||
//           !data.email ||
//           !data.name ||
//           !data.firstname ||
//           !data.secondname
//         ) {
//           const err = new Error(
//             'Error while retrieving registration response.'
//           );
//           reject(err);
//           return;
//         }
//         const fullData = _.extend(receivedData.data, {
//           password: formData.password,
//         });
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

//   if (!attrs.email) {
//     errors.email = t("can't be blank");
//   } else if (!Validate.email(attrs.email)) {
//     errors.email = 'invalid';
//   }

//   if (!attrs.firstname) {
//     errors.firstname = t("can't be blank");
//   }

//   if (!attrs.secondname) {
//     errors.secondname = t("can't be blank");
//   }

//   if (!attrs.password) {
//     errors.password = t("can't be blank");
//   } else if (attrs.password.length < 2) {
//     errors.password = t('is too short');
//   }

//   if (!attrs.passwordConfirm) {
//     errors.passwordConfirm = t("can't be blank");
//   } else if (attrs.passwordConfirm !== attrs.password) {
//     errors.passwordConfirm = t('passwords are not equal');
//   }

//   if (!attrs.termsAgree) {
//     errors.termsAgree = t('you must agree to the terms');
//   }

//   if (!_.isEmpty(errors)) {
//     return errors;
//   }

//   return null;
// }

class Component extends React.Component {
  state = {
    showPassword: false,
    showPopover: false,
  };

  constructor(props) {
    super(props);
    this.userEmail = React.createRef();
    this.userFirstname = React.createRef();
    this.userSecondname = React.createRef();
    this.userPassword = React.createRef();
    this.userPasswordConfirm = React.createRef();
  }

  // updateInputValidation(validation) {
  //   this.setState({
  //     userEmailError: validation.email,
  //     userFirstnameError: validation.firstname,
  //     userSecondnameError: validation.secondname,
  //     userPasswordError: validation.password,
  //     userPasswordConfirmError: validation.passwordConfirm,
  //     termsAgreeError: validation.termsAgree,
  //   });
  // }

  // onSubmit() {
  //   const { userModel } = this.props;

  //   if (!Device.isOnline()) {
  //     radio.trigger('app:dialog', {
  //       title: 'Sorry',
  //       body: 'Looks like you are offline!',
  //     });
  //     return;
  //   }

  //   const email = this.userEmail.current.value;
  //   const firstname = this.userFirstname.current.value;
  //   const secondname = this.userSecondname.current.value;

  //   const data = {
  //     email: email.trim(),
  //     firstname: firstname.trim(),
  //     secondname: secondname.trim(),
  //     password: this.userPassword.current.value,
  //     passwordConfirm: this.userPasswordConfirm.current.value,
  //     termsAgree: this.state.termsAgree,
  //   };

  //   const validationError = validateForm(data);
  //   this.updateInputValidation(validationError || {});
  //   if (validationError) {
  //     return;
  //   }

  //   radio.trigger('app:loader');
  //   register(data, userModel)
  //     .then(() => {
  //       radio.trigger('app:dialog', {
  //         title: 'Welcome aboard!',
  //         body:
  //           'Before submitting any records please check your email and ' +
  //           'click on the verification link.',
  //         buttons: [
  //           {
  //             title: 'OK, got it',
  //             onClick() {
  //               radio.trigger('app:dialog:hide');
  //               window.history.back();
  //             },
  //           },
  //         ],
  //         onHide() {
  //           window.history.back();
  //         },
  //       });
  //     })
  //     .catch(err => {
  //       Log(err, 'e');
  //       radio.trigger('app:dialog:error', err);
  //     });
  // }

  onTermsAgree = checked => {
    this.setState({ termsAgree: checked });
  };

  togglePassword = () => {
    this.setState(prevState => ({
      showPassword: !prevState.showPassword,
    }));
  };

  setShowPopover = val => {
    this.setState({ showPopover: val });
  };

  render() {
    const { showPassword } = this.state;
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
        <AppHeader title="Register" />
        <IonContent>
          <ion-list lines="full">
            <ion-item error={this.state.userEmailError}>
              <IonIcon name="mail" faint size="small" slot="start" />
              <ion-input
                ref={this.userEmail}
                required
                type="text"
                placeholder={t('Email')}
              />
            </ion-item>
            <ion-item error={this.state.userFirstnameError}>
              <IonIcon name="person" faint size="small" slot="start" />
              <ion-input
                ref={this.userFirstname}
                required
                type="text"
                placeholder={t('First Name')}
              />
            </ion-item>
            <ion-item error={this.state.userSecondnameError}>
              <IonIcon name="person" faint size="small" slot="start" />
              <ion-input
                ref={this.userSecondname}
                required
                type="text"
                placeholder={t('Surname')}
              />
            </ion-item>
            <ion-item error={this.state.userPasswordError}>
              <IonIcon name="key" faint size="small" slot="start" />
              <ion-input
                ref={this.userPassword}
                required
                type={showPassword ? 'text' : 'password'}
                placeholder={t('Password')}
              />
              <IonIcon
                name={showPassword ? 'eye' : 'eye-off'}
                faint
                size="small"
                slot="end"
                onClick={this.togglePassword}
              />
            </ion-item>

            <ion-item error={this.state.termsAgreeError}>
              <ion-label>
                {t('I agree to')}
                {' '}
                <a
                  href="#info/terms"
                  style={{ display: 'inline', color: '#91a71c' }}
                >
                  {t('Terms and Conditions')}
                </a>
              </ion-label>

              <Toggle onToggle={this.onTermsAgree} />
            </ion-item>
          </ion-list>
          <ion-button
            onClick={() => this.setShowPopover(true)}
            // onClick={this.onSubmit}
            expand="full"
            disabled={!this.state.termsAgree}
            color="primary"
          >
            {t('Register')}
          </ion-button>
        </IonContent>
      </>
    );
  }
}

Component.propTypes = {
  // userModel: PropTypes.object.isRequired,
};

export default Component;
