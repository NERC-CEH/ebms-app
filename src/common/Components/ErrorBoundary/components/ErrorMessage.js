import React from 'react';
import PropTypes from 'prop-types';
import { Trans as T } from 'react-i18next';
import './styles.scss';

function ErrorMessage({ eventId }) {
  return (
    <div className="error-boundary-message">
      <h5>
        <T>Oops! Something, went wrong.</T>
      </h5>

      <p className="error-boundary-message-code">
        {eventId && <T>This is the error event id: {{ eventId }}</T>}
      </p>
    </div>
  );
}

ErrorMessage.propTypes = {
  eventId: PropTypes.any,
};

export default ErrorMessage;
