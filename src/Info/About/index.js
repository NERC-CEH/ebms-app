import React from 'react';
import { IonList, IonItem, IonLabel, IonPage } from '@ionic/react';
import AppHeader from 'Components/Header';
import AppMain from 'Components/Main';
import './styles.scss';

const Component = () => (
  <IonPage>
    <AppHeader title={t('About')} />
    <AppMain id="about" class="ion-padding">
      <IonList lines="none">
        <IonItem>
          <IonLabel>
            {t(
              'This app contributes data to the European Butterfly Monitoring Scheme (eBMS).'
            )}
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            {t(
              'The app was developed as part of the Assessing Butterflies in Europe (ABLE) project.'
            )}
          </IonLabel>
        </IonItem>

        <IonItem>
          <p>
            {t(`The ABLE project is a partnership between`)}
            {' '}
            <a href="http://www.bc-europe.eu/">Butterfly Conservation Europe</a>
            ,
            {' '}
            <a href="www.ceh.ac.uk">
              the Centre for Ecology and Hydrology (UK)
            </a>
            ,
            {' '}
            <a href="https://www.ufz.de/index.php">
              the Helmholtz Centre for Environmental Research (UFZ, Germany) -
              Josef Settele, Oliver Schweiger
            </a>
            ,
            {' '}
            <a href="https://www.vlinderstichting.nl/">
              Dutch Butterfly Conservation
            </a>
            {' '}
            {t('and')}
            {' '}
            <a href="https://butterfly-conservation.org/">
              Butterfly Conservation (UK)
            </a>
            .
            {' '}
          </p>
        </IonItem>
      </IonList>
      <IonList lines="none">
        <IonItem lines="inset">
          <IonLabel>
            <b>{t('App Development')}</b>
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            {t('This app was hand crafted with love by')}
            <a href="https://flumens.io" style={{ whiteSpace: 'nowrap' }}>
              {' '}
              Flumens.
            </a>
            {' '}
            {t(
              'Agency specializing in building bespoke data oriented sollutions.'
            )}
            {' '}
            {t('For suggestions and feedback please do not hesitate to')}
            {' '}
            <a href="mailto:apps%40ceh.ac.uk?subject=eBMS%20App">
              {t('contact us')}
            </a>
            .
          </IonLabel>
        </IonItem>
      </IonList>
    </AppMain>
  </IonPage>
);

Component.propTypes = {};

export default Component;
