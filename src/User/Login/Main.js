import React from 'react';
import PropTypes from 'prop-types';
import { IonIcon, IonButton, IonList, IonItem } from '@ionic/react';
import { Main } from '@apps';
import { Trans as T } from 'react-i18next';
import { key, person, eye, eyeOff } from 'ionicons/icons';
import { Formik, Form } from 'formik';
import InputWithValidation from 'Lib/InputWithValidation';

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
      <Main>
        <div className="info-message">
          <p>
            <T>Please sign in with your eBMS account or register.</T>
          </p>
        </div>
        <Formik
          validationSchema={schema}
          onSubmit={onSubmit}
          initialValues={{}}
        >
          {props => (
            <Form>
              <IonList lines="full">
                <InputWithValidation
                  name="name"
                  placeholder={t('Username or email')}
                  icon={person}
                  type="text"
                  {...props}
                />
                <InputWithValidation
                  name="password"
                  placeholder={t('Password')}
                  icon={key}
                  type={showPassword ? 'text' : 'password'}
                  {...props}
                >
                  <IonButton
                    slot="end"
                    onClick={this.togglePassword}
                    fill="clear"
                  >
                    <IonIcon
                      icon={showPassword ? eye : eyeOff}
                      faint
                      size="small"
                    />
                  </IonButton>
                </InputWithValidation>
              </IonList>

              <IonButton color="primary" type="submit" expand="block">
                <T>Sign in</T>
              </IonButton>

              <IonList>
                <IonItem routerLink="/user/register" detail>
                  <T>Register</T>
                </IonItem>
                <IonItem routerLink="/user/reset" detail>
                  <T>Forgot password?</T>
                </IonItem>
              </IonList>
            </Form>
          )}
        </Formik>
      </Main>
    );
  }
}

Component.propTypes = {
  schema: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default Component;
