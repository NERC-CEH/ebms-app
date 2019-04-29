import React from 'react';
import { IonContent } from '@ionic/react';
import AppHeader from 'common/Components/Header';

export default () => (
  <>
    <AppHeader title={t('Help')} />
    <IonContent class="ion-padding">
      <small>TODO: add help info text</small>
    </IonContent>
  </>
);
