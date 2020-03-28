import React from 'react';
import PropTypes from 'prop-types';
import { IonList, IonItem, IonLabel } from '@ionic/react';

const Section = ({ children }) => <IonList lines="none">{children}</IonList>;
Section.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

Section.P = ({ children }) => (
  <IonItem>
    <IonLabel>{children}</IonLabel>
  </IonItem>
);
Section.P.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

Section.H = ({ children }) => (
  <IonItem lines="inset">
    <IonLabel>
      <b>{children}</b>
    </IonLabel>
  </IonItem>
);
Section.H.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default Section;
