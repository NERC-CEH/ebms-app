import React from 'react';
import PropTypes from 'prop-types';
import { IonContent, IonButton, IonList } from '@ionic/react';
import { person } from 'ionicons/icons';
import { Formik, Form } from 'formik';
import InputWithValidation from 'Components/InputWithValidation';

const Component = ({ onSubmit, schema }) => {
  return (
    <IonContent id="reset-page">
      <div className="info-message">
        <p>
          {t(
            'Enter your username or email address to request a password reset.'
          )}
        </p>
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
            </IonList>
            <IonList class="login-buttons">
              <IonButton expand="full" color="primary" type="submit">
                {t('Reset')}
              </IonButton>
            </IonList>
          </Form>
        )}
      />
    </IonContent>
  );
};

Component.propTypes = {
  schema: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default Component;
