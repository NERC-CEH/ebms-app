import React from 'react';
import PropTypes from 'prop-types';
import { IonButton, IonList } from '@ionic/react';
import Main from 'Lib/Main';
import { person } from 'ionicons/icons';
import { Formik, Form } from 'formik';
import InputWithValidation from 'Lib/InputWithValidation';

const Component = ({ onSubmit, schema }) => {
  return (
    <Main id="reset-page">
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
        initialValues={{}}
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

            <IonButton color="primary" type="submit" expand="block">
              {t('Reset')}
            </IonButton>
          </Form>
        )}
      />
    </Main>
  );
};

Component.propTypes = {
  schema: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default Component;
