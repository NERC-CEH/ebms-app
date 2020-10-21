import React from 'react';
import PropTypes from 'prop-types';
import { IonIcon, IonButton, IonList } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import { Main, InputWithValidation, ToggleWithValidation } from '@apps';
import {
  personOutline,
  mailOutline,
  keyOutline,
  lockOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';
import { Formik, Form } from 'formik';
import config from 'config';

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
    const { onSubmit, schema, lang } = this.props;

    return (
      <Main>
        <Formik
          validationSchema={schema}
          onSubmit={onSubmit}
          initialValues={{}}
        >
          {props => (
            <Form>
              <IonList lines="full">
                <InputWithValidation
                  name="email"
                  placeholder="Email"
                  icon={mailOutline}
                  type="email"
                  {...props}
                />
                <InputWithValidation
                  name="firstname"
                  placeholder="First Name"
                  icon={personOutline}
                  type="text"
                  {...props}
                />
                <InputWithValidation
                  name="secondname"
                  placeholder="Surname"
                  icon={personOutline}
                  type="text"
                  {...props}
                />
                <InputWithValidation
                  name="password"
                  placeholder="Password"
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
                <ToggleWithValidation
                  name="terms"
                  // prettier-ignore
                  label={(
                    <>
                      <T>I agree to</T>{' '}
                      <a
                        href={`${config.site_url}/privacy-notice?lang=${lang}`}
                      >
                        <T>Terms and Conditions</T>
                      </a>
                    </>
                  )}
                  icon={lockOutline}
                  type="terms"
                  {...props}
                />
              </IonList>

              <IonButton color="primary" type="submit" expand="block">
                <T>Register</T>
              </IonButton>
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
  lang: PropTypes.string.isRequired,
};

export default Component;
