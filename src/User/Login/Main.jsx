import React from 'react';
import PropTypes from 'prop-types';
import { IonIcon, IonButton, IonList, IonItem } from '@ionic/react';
import { Main, InputWithValidation, InfoMessage } from '@apps';
import { Trans as T } from 'react-i18next';
import {
  keyOutline,
  personOutline,
  eyeOutline,
  eyeOffOutline,
  informationCircle,
} from 'ionicons/icons';
import { Formik, Form } from 'formik';
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
      <Main>
        <InfoMessage icon={informationCircle}>
          Please sign in with your eBMS account or register.
        </InfoMessage>

        <Formik
          validationSchema={schema}
          onSubmit={onSubmit}
          initialValues={{}}
        >
          {props => (
            <Form>
              <IonList lines="full">
                <div className="rounded">
                  <InputWithValidation
                    name="email"
                    placeholder={t('Username or email')}
                    icon={personOutline}
                    type="email"
                    {...props}
                  />
                  <InputWithValidation
                    name="password"
                    placeholder={t('Password')}
                    icon={keyOutline}
                    type={showPassword ? 'text' : 'password'}
                    {...props}
                  >
                    <IonButton
                      slot="end"
                      onClick={this.togglePassword}
                      fill="clear"
                    >
                      <IonIcon
                        icon={showPassword ? eyeOutline : eyeOffOutline}
                        faint
                        size="small"
                      />
                    </IonButton>
                  </InputWithValidation>
                </div>
              </IonList>

              <IonButton color="primary" type="submit" expand="block">
                <T>Sign in</T>
              </IonButton>

              <IonList>
                <div className="rounded">
                  <IonItem routerLink="/user/register" detail>
                    <T>Register</T>
                  </IonItem>
                  <IonItem routerLink="/user/reset" detail>
                    <T>Forgot password?</T>
                  </IonItem>
                </div>
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
