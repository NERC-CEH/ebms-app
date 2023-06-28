import { Formik, Form } from 'formik';
import { informationCircle, mailOutline } from 'ionicons/icons';
import PropTypes from 'prop-types';
import { Trans as T } from 'react-i18next';
import { Main, InputWithValidation, InfoMessage } from '@flumens';
import { IonButton, IonList } from '@ionic/react';
import './styles.scss';

const Component = ({ onSubmit, schema }) => {
  const resetForm = props => (
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
        </div>
      </IonList>

      {/** https://github.com/formium/formik/issues/1418 */}
      <input type="submit" style={{ display: 'none' }} />
      <IonButton color="primary" type="submit" expand="block">
        <T>Reset</T>
      </IonButton>
    </Form>
  );

  return (
    <Main>
      <InfoMessage className="blue" icon={informationCircle}>
        Enter your email address to request a password reset.
      </InfoMessage>

      <Formik
        validationSchema={schema}
        onSubmit={onSubmit}
        initialValues={{
          email: '',
        }}
      >
        {resetForm}
      </Formik>
    </Main>
  );
};

Component.propTypes = {
  schema: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default Component;
