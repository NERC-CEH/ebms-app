import React from 'react';
import PropTypes from 'prop-types';
import { IonContent, IonIcon, IonButton, IonList, IonItem } from '@ionic/react';
import { key, person, eye, eyeOff } from 'ionicons/icons';
import { Formik, Form } from 'formik';
import InputWithValidation from 'Components/InputWithValidation';
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
              <IonList class="login-buttons">
                <IonButton expand="full" color="primary" type="submit">
                  {t('Sign in')}
                </IonButton>
              </IonList>

              <IonList>
                <IonItem routerLink="/user/register" detail>
                  {t('Register')}
                </IonItem>
                <IonItem routerLink="/user/reset" detail>
                  {t('Forgot password?')}
                </IonItem>
              </IonList>
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
