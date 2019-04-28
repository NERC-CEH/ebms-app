import React from 'react';
import { IonContent } from '@ionic/react';
import AppHeader from 'common/Components/Header';

const Component = () => (
  <>
    <AppHeader title="About" />
    <IonContent class="ion-padding">
      <small>TODO: add about the app text</small>
    </IonContent>
  </>
);

Component.propTypes = {};

export default Component;
