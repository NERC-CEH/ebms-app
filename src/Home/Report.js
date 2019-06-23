import React from 'react';
import {
  IonContent,
  IonList,
  IonItem,
  IonItemDivider,
  IonLabel,
} from '@ionic/react';

const Component = () => (
  <>
    <IonContent class="ion-padding">
      <IonList lines="none">
        <IonItemDivider>
          <IonLabel>{t('TOP RECORDERS')}</IonLabel>
        </IonItemDivider>
        <IonItem><small>{t('Not enough data yet')}</small></IonItem>
        <IonItemDivider>
          <IonLabel>{t('TOP SPECIES')}</IonLabel>
        </IonItemDivider>
        <IonItem><small>{t('Not enough data yet')}</small></IonItem>
      </IonList>
    </IonContent>
  </>
);

Component.propTypes = {};

export default Component;
