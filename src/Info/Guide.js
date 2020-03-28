import React from 'react';
import { IonList, IonItem, IonLabel } from '@ionic/react';
import Page from 'Lib/Page';
import { Trans as T } from 'react-i18next';
import Main from 'Lib/Main';
import Header from 'Lib/Header';

/* eslint react/prop-types:0 */
const P = ({ children }) => (
  <IonItem>
    <IonLabel>{children}</IonLabel>
  </IonItem>
);

const H = ({ children }) => (
  <IonItem lines="inset">
    <IonLabel>
      <b>{children}</b>
    </IonLabel>
  </IonItem>
);

const Section = ({ children }) => <IonList lines="none">{children}</IonList>;

const helpEmail = 'ebms@ceh.ac.uk';
const eBMSWebsiteLink = ''; // backwards compatible

const Component = () => (
  <Page id="about">
    <Header title={t('Guide')} />
    <Main class="ion-padding">
      <Section>
        <H>{t('How to use the app')}</H>
        <P>
          {t(
            'You can use this app to monitor butterflies anywhere in Europe. The results will be entered into the European Butterfly Monitoring database and used to develop trends of butterflies across Europe. To use the app you will first have to register with a username or email and enter a password.'
          )}
        </P>
        <P>
          {t(
            'The preferred method is to conduct a 15-minute Count.  This can be done at any place and at any time when butterflies are active (i.e. when the weather is warm and preferably sunny). You can also use the app to record your established butterfly transects. Later in 2020, the app will also include the ability to submit casual records.  The notes below tell you how to use the currently available methods.'
          )}
        </P>
      </Section>

      <Section>
        <H>{t('How to do a 15-minute Count')}</H>
        <P>
          {t(
            'This is the default method on the app. Simply count butterflies for a 15 minute period, either in a defined area such as a field, or while walking along, or standing on a fixed point counting butterflies that fly past. There is no need to draw the route as the app will know your route, provided you have the GPS tracking facility switched on in your Settings. Otherwise you will have to draw the area searched on a map, using the app. To start, touch the + button at the bottom of the screen. The app counts down the 15 minutes once you have started, but you can pause at any time (for example to identify a butterfly) by pressing the pause button. At the end of the survey you can review your records and make sure the totals are correct before submitting.'
          )}
        </P>
        <P>
          {t(
            'Add species you see by pressing the + ADD button and start typing a species name. The selection of species will then appear as a drop down menu. You can use either scientific or English names. Select the species you see and once in your list of butterflies, touch the left hand number to increase the count of how many you have seen. You can review this number and amend at the end as well. You can also add photos if you want and add comments.'
          )}
        </P>
        <P>
          {t(
            'Once you have finished your 15-minute Count and checked that the species and numbers seen are correct, press the UPLOAD button to submit. This is important to make sure your data is stored securely in the eBMS database. A record of the count will be held on your device for future reference as well as on your online account.'
          )}
        </P>
      </Section>

      <Section>
        <H>{t('How to record along an existing transect')}</H>
        <P>
          <T>
            You can also use the app to submit records while walking an existing
            butterfly monitoring transect. These have already been established
            by country Butterfly Monitoring Schemes and are best completed by
            experienced recorders. Recording existing transects within the app
            requires that your account is already linked to a transect setup
            within the eBMS system. If no transect sites are listed once you are
            logged into the app, please contact your national co-ordinator
            (please email {{ helpEmail }} for advice).
          </T>
        </P>
        <P>
          {t(
            'To start with the transect count, hold down the + button (a long-press) at the bottom of the screen and select eBMS Transect. The Transect page will appear with all the options to be completed. First, you have to select your transects (you will need to be logged in for this, and for transect routes to be linked to your user account).  Once you have selected your transect site, you can fill out the necessary weather details (e.g. temperature, wind speed etc) and other required information (e.g. start time) on the Transect page.  You then add a list of species seen and the number counted for each transect section, in the same way as for a 15-minute count. Once you have finished your Transect and checked that the species and numbers seen are correct, press the FINISH button to submit.'
          )}
        </P>
      </Section>

      <Section>
        <H>{t('Survey section')}</H>
        <P>
          <T>
            In this tab, on the right part of the + Button, you can see the
            PENDING counts, your records that have not been submitted and the
            UPLOADED counts, the ones submitted to the eBMS database. The
            Pending counts can be submitted to the system by clicking on it and
            pressing the Upload option. You could see the species list that you
            recorded for Uploaded counts. All your records can also be viewed
            and edited on the {{ eBMSWebsiteLink }}
          </T>
          <a
            href="https://butterfly-monitoring.net/elastic/my-records"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('eBMS website')}
          </a>
          .
        </P>
      </Section>
      <Section>
        <H>{t('App Settings')}</H>
        <P>
          {t(
            'Go to the application setting page to change the language and the country. The selected country is important in order to see different species in the Picture Guide, you will see only the species occurring in that country.'
          )}
        </P>
        <P>
          {t(
            'You can also switch on the Training Mode, when you are still learning to identify butterflies.'
          )}
        </P>
      </Section>
    </Main>
  </Page>
);

Component.propTypes = {};

export default Component;
