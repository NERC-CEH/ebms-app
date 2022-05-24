import * as React from 'react';
import PropTypes from 'prop-types';
import { IonIcon, IonButton, IonList, IonRouterLink } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import { Main, InputWithValidation } from '@flumens';
import {
  personOutline,
  mailOutline,
  keyOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';
import { Formik, Form } from 'formik';
import config from 'common/config';
import './styles.scss';

class Component extends React.Component {
  state = {
    showPassword: false,
  };

  togglePassword = () => {
    const invertPasswordShow = prevState => ({
      showPassword: !prevState.showPassword,
    });
    this.setState(invertPasswordShow);
  };

  registrationForm = props => {
    const { showPassword } = this.state;
    const { lang } = this.props;

    return (
      <Form>
        <IonList lines="full">
          <div className="rounded">
            <InputWithValidation
              name="email"
              placeholder="Email"
              icon={mailOutline}
              type="email"
              {...props}
            />
            <InputWithValidation
              name="firstName"
              placeholder="First Name"
              icon={personOutline}
              type="text"
              {...props}
            />
            <InputWithValidation
              name="secondName"
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
              <IonButton slot="end" onClick={this.togglePassword} fill="clear">
                <IonIcon
                  icon={showPassword ? eyeOutline : eyeOffOutline}
                  faint
                  size="small"
                />
              </IonButton>
            </InputWithValidation>
          </div>

          <div className="terms-info-text">
            <T>I agree to</T>{' '}
            <IonRouterLink
              href={`${config.backend.url}/privacy-notice?lang=${lang}`}
            >
              <T>Privacy Policy</T>
            </IonRouterLink>{' '}
            <T>and</T>{' '}
            <IonRouterLink
              href={`${config.backend.url}/terms-and-conditions?lang=${lang}`}
            >
              <T>Terms and Conditions</T>
            </IonRouterLink>
          </div>
        </IonList>

        <IonButton color="primary" type="submit" expand="block">
          <T>Register</T>
        </IonButton>
      </Form>
    );
  };

  render() {
    const { onSubmit, schema } = this.props;

    return (
      <Main>
        <Formik
          validationSchema={schema}
          onSubmit={onSubmit}
          initialValues={{}}
        >
          {this.registrationForm}
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
