import { personOutline, addOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Page, Main, Header, Collapse } from '@flumens';
import { IonList, IonIcon } from '@ionic/react';
import './styles.scss';

export default () => (
  <Page id="help">
    <Header title="Help" />
    <Main className="ion-padding">
      <IonList lines="none">
        <h3 className="list-title">
          <T>Surveys</T>
        </h3>
        <div className="rounded-list">
          <Collapse title="How to start a survey">
            <p>
              <T>To start a new survey you can press the plus button</T>
              <IonIcon
                className="help-page-record-start-icon"
                icon={addOutline}
              />
              <T>
                in the home page footer. This will start a new 15 minute survey.
              </T>
              <br />
              <br />
              <strong>
                <T>Selecting species</T>
              </strong>
              <br />
              <T>Please press the Add</T>
              <IonIcon icon={addOutline} />
              <T>
                button in your new survey edit page. This will bring you to the
                taxa search page. After selecting the species, this will add it
                to your survey list.
              </T>
              <br />
              <br />
              <b>
                <T>Note</T>:
              </b>{' '}
              <T>
                you can increment the species count by tapping on the number
                next to the species name in the list.
              </T>
              <br />
              <br />
              <T>
                To delete a species from your survey list your can swipe it left
                and click the delete button.
              </T>
              <br />
              <br />
              <T>
                To add more information to your species occurrence, you can open
                the species entry by clicking on it.
              </T>
              <br />
              <br />
              <T>
                To finish a record you should also fill in the details of the
                area.
              </T>
              <br />
              <br />
              <T>
                When finished, set for submission by pressing the Finish button
                in the header.
              </T>
            </p>
          </Collapse>
          <Collapse title="Searching for species">
            <p>
              <T>
                The application holds around 500 butterfly species list and all
                the associated taxonomy ranks. For quicker searching of the taxa
                you can use different shortcuts. For example, to find
              </T>{' '}
              <i>Lopinga achine</i> <T>you can type in the search bar</T>
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
          <Collapse title="Sync. with the website">
            <p>
              <T>All your saved surveys will be shown on your account page.</T>
              <IonIcon icon={personOutline} />
              <br />
              <br />
              <T>
                By default a survey is in a &#39;draft&#39; mode which will not
                be sent to the database until the &#39;Finish&#39; button in the
                header is clicked. The application will try to submit your
                record once there is a good network connection.
              </T>
              <br />
              <br />
              <b>
                <T>Note</T>:
              </b>{' '}
              <T>
                you have to be signed in to your website account and have a
                network connection, for the records to be automatically
                synchronised in the background
              </T>
              .
              <br />
            </p>
          </Collapse>
          <Collapse title="Delete a record">
            <p>
              <T>
                To delete a record, swipe it left in your account page and click
                the delete button.
              </T>
            </p>
          </Collapse>
          <Collapse title="Assign a project to a count">
            <ol className="list-decimal pl-4">
              <T>
                <li>Start a count.</li>
                <li>Select "Additional Details" then "Project".</li>
                <li>Finally, choose the appropriate project.</li>
              </T>
            </ol>
          </Collapse>
          <Collapse title="Assign a site to a count">
            <ol className="list-decimal pl-4">
              <T>
                <li>Start a count.</li>
                <li>
                  Assign a project to the count, see instructions on how to
                  select a project.
                </li>
                <li>Turn off the GPS in the header of the "Area" page.</li>
                <li>
                  Select the "Site Drawing" tool on the right side of the
                  screen.
                </li>
                <li>
                  Choose an area on the map and confirm your selection on the
                  right side of the screen.
                </li>
                <li>
                  Press the "Add" button located on the favourite sites panel in
                  the bottom right corner of the screen. If the panel is not
                  visible, you can open it by clicking the favourite sites
                  button (star icon) at the top right.
                </li>
                <li>
                  You will be prompted to answer some questions about the site.
                </li>
                <li>
                  Press "Save" in the top right corner after answering the
                  questions. The site will be saved, and it can be selected for
                  future counts conducted in that location.
                </li>
                <li>Finally, choose the site for the current count.</li>
              </T>
            </ol>
          </Collapse>
        </div>

        <h3 className="list-title">
          <T>User</T>
        </h3>
        <div className="rounded-list">
          <Collapse title="Sign in/out or register">
            <p>
              <T>
                To login, open the main menu page click Login or Register
                buttons and follow the instructions.
              </T>
              <br />
              <br />
              <T>
                To logout, visit the main menu page and click the logout button.
              </T>
              .
              <br />
              <br />
              <b>
                <T>Note</T>:
              </b>{' '}
              <T>
                after registering a new account you must verify your email
                address by clicking on a verification link sent to your email
              </T>
              .
            </p>
          </Collapse>
        </div>
      </IonList>
    </Main>
  </Page>
);
