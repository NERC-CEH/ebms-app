import React from 'react';
import { IonList, IonItemDivider, IonIcon } from '@ionic/react';
import Page from 'Components/Page';
import Main from 'Components/Main';
import { settings, undo, person, add, send } from 'ionicons/icons';
import Collapse from 'Components/Collapse/index';
import Header from 'Components/Header';
import './styles.scss';

export default () => (
  <Page id="help">
    <Header title={t('Help')} />
    <Main class="ion-padding">
      <IonList lines="none">
        <IonItemDivider>{t('Surveys')}</IonItemDivider>
        <Collapse title={t('How to start a survey')}>
          <p>
            {t('To start a new survey you can press the plus button')}
            <IonIcon class="help-page-record-start-icon" icon={add} />
            {t(
              'in the home page footer. This will start a new 15 minute survey.'
            )}
            <br />
            <br />
            <strong>{t('Selecting species')}</strong>
            <br />
            {t('Please press the Add')}
            <IonIcon icon={add} />
            {t(
              'button in your new survey edit page. This will bring you to the taxa search page. After selecting the species, this will add it to your survey list.'
            )}
            <br />
            <br />
            <b>{t('Note')}:</b>{' '}
            {t(
              'you can increment the species count by tapping on the number next to the species name in the list.'
            )}
            <br />
            <br />
            {t(
              'To delete a species from your survey list your can swipe it left and click the delete button.'
            )}
            <br />
            <br />
            {t(
              'To add more information to your species occurrence, you can open the species entry by clicking on it.'
            )}
            <br />
            <br />
            {t(
              'To finish a record you should also fill in the details of the area.'
            )}
            <br />
            <br />
            {t(
              'When finished, set for submission by pressing the Finish button in the header.'
            )}
          </p>
        </Collapse>

        <Collapse title={t('Searching for species')}>
          <p>
            {t(
              'The application holds around 500 butterfly species list and all the associated taxonomy ranks. For quicker searching of the taxa you can use different shortcuts. For example, to find'
            )}{' '}
            <i>Lopinga achine</i> {t('you can type in the search bar')}
            :
            <br />
            <br />
            <i>lop ach</i>
            <br />
            <i>lopac</i>
            <br />
            <i>lop .ne</i>
            <br />
            <i>. achine</i>
          </p>
        </Collapse>
        <Collapse title={t('Sync. with the website')}>
          <p>
            {t('All your saved surveys will be shown on your account page.')}
            <IonIcon icon={person} />
            <br />
            <br />
            {t(
              `By default a survey is in a 'draft' mode which will not be sent to the database until the 'Finish' button in the header is clicked. The application will try to submit your record once there is a good network connection.`
            )}
            <br />
            <br />
            {t('If the record has reached the database a red')}{' '}
            <IonIcon icon={send} style={{ color: 'red' }} />
            {t('(set for submission & saved locally) will become green')}{' '}
            <IonIcon icon={send} style={{ color: 'green' }} /> (
            {t('synced to the database')}
            ).
            <br />
            <br />
            <b>{t('Note')}:</b>{' '}
            {t(
              'you have to be signed in to your website account and have a network connection, for the records to be automatically synchronised in the background'
            )}
            .
            <br />
          </p>
        </Collapse>
        <Collapse title={t('Delete a record')}>
          <p>
            {t(
              'To delete a record, swipe it left in your account page and click the delete button.'
            )}
          </p>
        </Collapse>

        <IonItemDivider>{t('User')}</IonItemDivider>
        <Collapse title={t('Sign in/out or register')}>
          <p>
            {t(
              'To login, open the main menu page click Login or Register buttons and follow the instructions.'
            )}
            <br />
            <br />
            {t(
              'To logout, visit the main menu page and click the logout button.'
            )}
            .
            <br />
            <br />
            <b>{t('Note')}:</b>{' '}
            {t(
              'after registering a new account you must verify your email address by clicking on a verification link sent to your email'
            )}
            .
          </p>
        </Collapse>

        <IonItemDivider>{t('Other')}</IonItemDivider>
        <Collapse title={t('Reset the application')}>
          <p>
            {t('Go to the application settings page')}{' '}
            <IonIcon icon={settings} /> {t('and click on the Reset')}{' '}
            <IonIcon icon={undo} />
            {t('button')}.
          </p>
        </Collapse>
      </IonList>
    </Main>
  </Page>
);
