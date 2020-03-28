import React from 'react';
import PropTypes from 'prop-types';
import { IonContent } from '@ionic/react';
import ErrorBoundary from './ErrorBoundary';

const Main = React.forwardRef(({ children, ...props }, ref) => {
  return (
    <ErrorBoundary>
      <IonContent {...props} ref={ref}>
        {children}
      </IonContent>
    </ErrorBoundary>
  );
});

Main.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
export default Main;
