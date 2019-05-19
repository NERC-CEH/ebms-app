import React from 'react';
import PropTypes from 'prop-types';
import { IonContent, IonIcon, IonButton, IonList } from '@ionic/react';
import { Formik, Form } from 'formik';
import AppHeader from 'common/Components/Header';
import InputWithValidation from 'common/Components/InputWithValidation';
import './styles.scss';

class Component extends React.Component {
  state = {
    showPassword: false,
  };

  togglePassword = () => {
    this.setState(prevState => ({
      showPassword: !prevState.showPassword,
    }));
  };

  render() {
    const { showPassword } = this.state;
    const { onSubmit, schema } = this.props;

    return (
      <>
        <AppHeader title={t('Login')} />
        <IonContent id="login-page">
          <div className="info-message">
            <p>{t('Please sign in with your eBMS account or register.')}</p>
          </div>
          <Formik
            validationSchema={schema}
            onSubmit={onSubmit}
            render={props => (
              <Form>
                <IonList lines="full">
                  <InputWithValidation
                    name="name"
                    placeholder={t('Username or email')}
                    icon="person"
                    type="text"
                    {...props}
                  />
                  <InputWithValidation
                    name="password"
                    placeholder={t('Password')}
                    icon="key"
                    type={showPassword ? 'text' : 'password'}
                    {...props}
                  >
                    <IonIcon
                      name={showPassword ? 'eye' : 'eye-off'}
                      faint
                      size="small"
                      slot="end"
                      onClick={this.togglePassword}
                    />
                  </InputWithValidation>
                </IonList>
                <IonList class="login-buttons">
                  <IonButton expand="full" color="primary" type="submit">
                    {t('Sign in')}
                  </IonButton>

                  <ion-button href="#user/register" expand="full" color="light">
                    {t('Register')}
                  </ion-button>

                  <ion-button href="#user/reset" expand="full" color="light">
                    {t('Forgot password?')}
                  </ion-button>
                </IonList>
              </Form>
            )}
          />
        </IonContent>
      </>
    );
  }
}

Component.propTypes = {
  schema: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default Component;
