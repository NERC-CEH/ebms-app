import React, { FC, useState } from 'react';
import { IonIcon, IonButton, IonList, IonItem } from '@ionic/react';
import { Main, InputWithValidation, InfoMessage } from '@apps';
import { Trans as T } from 'react-i18next';
import {
  keyOutline,
  eyeOutline,
  eyeOffOutline,
  informationCircle,
  mailOutline,
} from 'ionicons/icons';
import { Formik, Form } from 'formik';
import './styles.scss';

interface Props {
  onSubmit: any;
  schema: any;
}

const LoginMain: FC<Props> = ({ onSubmit, schema }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <Main>
      <InfoMessage className="blue" icon={informationCircle}>
        Please sign in with your eBMS account or register.
      </InfoMessage>

      <Formik validationSchema={schema} onSubmit={onSubmit} initialValues={{}}>
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form>
            <IonList lines="full">
              <div className="rounded">
                <InputWithValidation
                  name="email"
                  placeholder="Email"
                  icon={mailOutline}
                  type="email"
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />
                <InputWithValidation
                  name="password"
                  placeholder="Password"
                  icon={keyOutline}
                  type={showPassword ? 'text' : 'password'}
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                >
                  <IonButton slot="end" onClick={togglePassword} fill="clear">
                    <IonIcon
                      icon={showPassword ? eyeOutline : eyeOffOutline}
                      size="small"
                    />
                  </IonButton>
                </InputWithValidation>
              </div>
            </IonList>

            {/** https://github.com/formium/formik/issues/1418 */}
            <input type="submit" style={{ display: 'none' }} />
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
};

export default LoginMain;
