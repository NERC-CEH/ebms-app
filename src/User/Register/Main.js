import React from 'react';
import PropTypes from 'prop-types';
import { IonIcon, IonButton, IonList } from '@ionic/react';
import Main from 'Lib/Main';
import { person, mail, key, lock, eye, eyeOff } from 'ionicons/icons';
import { Formik, Form } from 'formik';
import InputWithValidation from 'Lib/InputWithValidation';
import ToggleWithValidation from 'Lib/ToggleWithValidation';
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
          render={props => (
            <Form>
              <IonList lines="full">
                <InputWithValidation
                  name="email"
                  placeholder={t('Email')}
                  icon={mail}
                  type="email"
                  {...props}
                />
                <InputWithValidation
                  name="firstname"
                  placeholder={t('First Name')}
                  icon={person}
                  type="text"
                  {...props}
                />
                <InputWithValidation
                  name="secondname"
                  placeholder={t('Surname')}
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
                <ToggleWithValidation
                  name="terms"
                  label={(
                    <>
                      {t('I agree to')}
                      {' '}
                      <a
                        href={`${config.site_url}/privacy-notice?lang=${lang}`}
                      >
                        {t('Terms and Conditions')}
                      </a>
                    </>
                  )}
                  icon={lock}
                  type="terms"
                  {...props}
                />
              </IonList>

              <IonButton color="primary" type="submit" expand="block">
                {t('Register')}
              </IonButton>
            </Form>
          )}
        />
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
