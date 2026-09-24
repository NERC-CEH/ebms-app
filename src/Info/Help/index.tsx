import { personOutline, addOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Page, Main, Header, Collapse } from '@flumens';
import { IonList, IonIcon } from '@ionic/react';
import './styles.scss';

export default () => (
  <Page id="help">
    <Header title="common.help" />
    <Main className="ion-padding">
      <IonList lines="none">
        <h3 className="list-title">
          <T>common.surveys</T>
        </h3>
        <div className="rounded-list">
          <Collapse title="info.howStartSurvey">
            <p>
              <T>info.startNewSurvey</T>
              <IonIcon
                className="help-page-record-start-icon"
                icon={addOutline}
              />
              <T>info.homePageFooter</T>
              <br />
              <br />
              <strong>
                <T>info.selectingSpecies</T>
              </strong>
              <br />
              <T>info.pleasePressAdd</T>
              <IonIcon icon={addOutline} />
              <T>info.buttonNewSurvey</T>
              <br />
              <br />
              <b>
                <T>common.note</T>:
              </b>{' '}
              <T>info.canIncrementSpecies</T>
              <br />
              <br />
              <T>info.deleteSpeciesSurvey</T>
              <br />
              <br />
              <T>info.addMoreInformation</T>
              <br />
              <br />
              <T>info.finishRecordShould</T>
              <br />
              <br />
              <T>info.whenFinishedSet</T>
            </p>
          </Collapse>
          <Collapse title="info.searchingSpecies">
            <p>
              {/* eslint-disable local/valid-trans-key */}
              <T>info.applicationHoldsAround</T> <i>Lopinga achine</i>{' '}
              <T>common.canTypeSearch</T>
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
              {/* eslint-enable local/valid-trans-key */}
            </p>
          </Collapse>
          <Collapse title="info.syncWebsite">
            <p>
              <T>info.allSavedSurveys</T>
              <IonIcon icon={personOutline} />
              <br />
              <br />
              <T>info.byDefaultSurvey</T>
              <br />
              <br />
              <b>
                <T>common.note</T>:
              </b>{' '}
              <T>info.haveSignedWebsite</T>
              .
              <br />
            </p>
          </Collapse>
          <Collapse title="info.deleteRecord">
            <p>
              <T>info.deleteRecordSwipe</T>
            </p>
          </Collapse>
          <Collapse title="info.assignProjectCount">
            <ol className="list-decimal pl-4">
              <T i18nKey="info.startCountSelect">
                <li>Start a count.</li>
                <li>Select "Additional Details" then "Project".</li>
                <li>Finally, choose the appropriate project.</li>
              </T>
            </ol>
          </Collapse>
        </div>
      </IonList>

      <IonList lines="none">
        <h3 className="list-title">
          <T>common.sites</T>
        </h3>
        <div className="rounded-list">
          <Collapse title="info.assignSiteCount">
            <ol className="list-decimal pl-4">
              <T i18nKey="info.assignSiteSteps">
                <li>Start a count.</li>
                <li>Select "Additional Details" then "Site".</li>
                <li>Finally, choose the site for the current count.</li>
              </T>
            </ol>
          </Collapse>

          <Collapse title="info.createNewSite">
            <ol className="list-decimal pl-4">
              <T i18nKey="info.goAppSettings">
                <li>Go to the app Settings page.</li>
                <li>Select "Sites".</li>
                <li>In the top-right corner press "Add" button.</li>
                <li>Fill in the necessary site details and press "Save".</li>
                <br />
                Note: you need to be logged in and have a network connection to
                create a new site.
              </T>
            </ol>
          </Collapse>
        </div>

        <h3 className="list-title">
          <T>common.user</T>
        </h3>
        <div className="rounded-list">
          <Collapse title="info.signOutRegister">
            <p>
              <T>info.loginOpenMain</T>
              <br />
              <br />
              <T>info.logoutVisitMain</T>
              .
              <br />
              <br />
              <b>
                <T>common.note</T>:
              </b>{' '}
              <T>info.afterRegisteringNew</T>.
            </p>
          </Collapse>
        </div>
      </IonList>
    </Main>
  </Page>
);
