import React from 'react';
import { IonList, IonItem, IonLabel } from '@ionic/react';
import Page from 'Lib/Page';
import Header from 'Lib/Header';
import Main from 'Lib/Main';
import './styles.scss';

const Component = () => (
  <Page id="about">
    <Header title={t('About')} />
    <Main id="about" class="ion-padding">
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
            {t(`The ABLE project is a partnership between`)}{' '}
            <a href="http://www.bc-europe.eu/">Butterfly Conservation Europe</a>
            ,{' '}
            <a href="www.ceh.ac.uk">
              the Centre for Ecology and Hydrology (UK)
            </a>
            ,{' '}
            <a href="https://www.ufz.de/index.php">
              the Helmholtz Centre for Environmental Research (UFZ, Germany) -
              Josef Settele, Oliver Schweiger
            </a>
            ,{' '}
            <a href="https://www.vlinderstichting.nl/">
              Dutch Butterfly Conservation
            </a>{' '}
            {t('and')}{' '}
            <a href="https://butterfly-conservation.org/">
              Butterfly Conservation (UK)
            </a>
            .{' '}
          </p>
        </IonItem>
      </IonList>
    </Main>
  </Page>
);

Component.propTypes = {};

export default Component;
