import React from 'react';
import PropTypes from 'prop-types';
import { IonContent, IonIcon, IonButton, IonList } from '@ionic/react';
import { Formik, Form } from 'formik';
import InputWithValidation from 'common/Components/InputWithValidation';
import ToggleWithValidation from 'common/Components/ToggleWithValidation';

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
      <IonContent id="register-page">
        <Formik
          validationSchema={schema}
          onSubmit={onSubmit}
          render={props => (
            <Form>
              <IonList lines="full">
                <InputWithValidation
                  name="email"
                  placeholder={t('Email')}
                  icon="mail"
                  type="email"
                  {...props}
                />
                <InputWithValidation
                  name="firstname"
                  placeholder={t('First Name')}
                  icon="person"
                  type="text"
                  {...props}
                />
                <InputWithValidation
                  name="secondname"
                  placeholder={t('Surname')}
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
                  <IonButton
                    slot="end"
                    onClick={this.togglePassword}
                    fill="clear"
                  >
                    <IonIcon
                      name={showPassword ? 'eye' : 'eye-off'}
                      faint
                      size="small"
                    />
                  </IonButton>
                </InputWithValidation>
                <ToggleWithValidation
                  name="terms"
                  label={(
                    <>
                      {t('I agree to')}
                      {' '}
                      <a href="https://butterfly-monitoring.net/privacy-notice">{t('Terms and Conditions')}</a>
                    </>
                  )}
                  icon="lock"
                  type="terms"
                  {...props}
                />
              </IonList>
              <IonButton expand="full" color="primary" type="submit">
                {t('Register')}
              </IonButton>
            </Form>
          )}
        />
      </IonContent>
    );
  }
}

Component.propTypes = {
  schema: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default Component;
