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
      <IonList>
        <IonItemDivider>
          <IonLabel>TOP RECORDERS</IonLabel>
        </IonItemDivider>
        <IonItem><small>TODO: add report</small></IonItem>
        <IonItemDivider>
          <IonLabel>TOP SPECIES</IonLabel>
        </IonItemDivider>
        <IonItem><small>TODO: add report</small></IonItem>
      </IonList>
    </IonContent>
  </>
);

Component.propTypes = {};

export default Component;
