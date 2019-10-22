/** ****************************************************************************
 * Loader view with a spinner for async and other components.
 **************************************************************************** */
import React from 'react';
import { IonSpinner } from '@ionic/react';
import './styles.scss';

// on Android the spinner is distorted, so requires manual OS check
export default () => <IonSpinner class="centered" />;
