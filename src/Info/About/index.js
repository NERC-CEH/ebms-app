import React from 'react';
import PropTypes from 'prop-types';
import { IonList, IonItem, IonLabel } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import Header from '@bit/flumens.apps.header';
import Page from 'Lib/Page';
import Main from 'Lib/Main';
import './styles.scss';

const Component = ({ appModel }) => {
  const isEnglish = appModel.attrs.language === 'en';
  return (
    <Page id="about">
      <Header title="About" />
      <Main id="about" class="ion-padding">
        <IonList lines="none">
          {isEnglish ? (
            <IonItem>
              <IonLabel>
                This app enables you to contribute to the recording and
                conservation of Europe’s butterflies. The app is not part of the
                Big Butterfly Count that is run in the UK by Butterfly
                Conservation each summer. Please visit their{' '}
                <a href="https://www.bigbutterflycount.org/">project website</a>{' '}
                for information on how to get involved in that survey. Data
                collected through this ButterflyCount app is shared with UK
                Butterfly Conservation (and other Butterfly Conservation Europe
                partners) to support their monitoring and conservation work.
              </IonLabel>
            </IonItem>
          ) : (
            <IonItem>
              <IonLabel>
                <T>
                  This app contributes data to the European Butterfly Monitoring
                  Scheme (eBMS).
                </T>
              </IonLabel>
            </IonItem>
          )}

          <IonItem>
            <IonLabel>
              <T>
                The app was developed as part of the Assessing Butterflies in
                Europe (ABLE) project.
              </T>
            </IonLabel>
          </IonItem>

          <IonItem>
            <p>
              <T>The ABLE project is a partnership between</T>{' '}
              <a href="http://www.bc-europe.eu/">
                Butterfly Conservation Europe
              </a>
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
              <T>and</T>{' '}
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
};

Component.propTypes = {
  appModel: PropTypes.object.isRequired,
};

export default Component;
