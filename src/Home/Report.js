import React from 'react';
import {
  IonContent,
  IonList,
  IonItem,
} from '@ionic/react';

const Component = () => (
  <>
    <IonContent id="home-report" class="ion-padding">
      <IonList lines="full">
        <IonItem class="empty">
          <span>
            <p>
              {t(
                'This app supports butterfly monitoring and conservation. Click on the + button below to starting counting butterflies.'
              )}
            </p>
            <br />
            <p>
              {t(
                'You will see lots of enhancements to this app as we add in new features over the coming months.'
              )}
            </p>
          </span>
        </IonItem>
      </IonList>

      {/* <IonList lines="none">
        <IonItemDivider>
          <IonLabel>{t('TOP RECORDERS')}</IonLabel>
        </IonItemDivider>
        <IonItem><small>{t('Not enough data yet')}</small></IonItem>
        <IonItemDivider>
          <IonLabel>{t('TOP SPECIES')}</IonLabel>
        </IonItemDivider>
        <IonItem><small>{t('Not enough data yet')}</small></IonItem>
      </IonList> */}
    </IonContent>
  </>
);

Component.propTypes = {};

export default Component;
