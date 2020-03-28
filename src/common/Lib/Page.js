import React from 'react';
import PropTypes from 'prop-types';
import { IonPage } from '@ionic/react';

function Page({ id, children, ...props }) {
  return (
    <IonPage id={id} {...props}>
      {children}
    </IonPage>
  );
}

Page.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default Page;
