import React from 'react';
import { Route } from 'react-router-dom';
import {
  IonTabs,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonRouterOutlet,
  IonFabButton,
  IonFabList,
  NavContext,
} from '@ionic/react';
import {
  personOutline,
  addOutline,
  bookOutline,
  menuOutline,
  homeOutline,
} from 'ionicons/icons';
import savedSamples from 'savedSamples';
import appModel from 'appModel';
import userModel from 'userModel';
import LongPressFabButton from 'Components/LongPressFabButton';
import { Trans as T } from 'react-i18next';
import PendingSurveysBadge from 'common/Components/PendingSurveysBadge';
import surveys from 'common/config/surveys';
import Report from './Report';
import Species from './Species';
import UserSurveys from './UserSurveys';
import Menu from './Menu';
import './styles.scss';

class Component extends React.Component {
  static contextType = NavContext;

  navigateToPrimarySurvey = () => {
    const primarySurveyName = appModel.attrs.primarySurvey || 'precise-area';

    this.context.navigate(`/survey/${primarySurveyName}/new`);
  };

  render() {
    const primarySurveyName = appModel.attrs.primarySurvey || 'precise-area';

    const getOtherSurveys = () => {
      const otherSurveys = Object.values(surveys).filter(
        ({ name }) => name !== primarySurveyName
      );

      // eslint-disable-next-line
      const getSurveyButton = ({ name, label }) => {
        if (name === 'area') return null; // for backwards compatible

        return (
          <IonFabButton
            class="fab-button-label"
            routerLink={`/survey/${name}/new`}
            key={name}
          >
            <IonLabel>
              <T>{label}</T>
            </IonLabel>
          </IonFabButton>
        );
      };

      return otherSurveys.map(getSurveyButton);
    };

    return (
      <>
        <IonTabs>
          <IonRouterOutlet>
            <Route
              path="/home/report"
              render={props => <Report appModel={appModel} {...props} />}
              exact
            />
            <Route
              path="/home/species"
              render={() => (
                <Species
                  appModel={appModel}
                  userModel={userModel}
                  savedSamples={savedSamples}
                />
              )}
              exact
            />
            <Route
              path="/home/user-surveys"
              render={() => <UserSurveys savedSamples={savedSamples} />}
              exact
            />
            <Route
              path="/home/menu"
              render={props => (
                <Menu
                  userModel={userModel}
                  appModel={appModel}
                  savedSamples={savedSamples}
                  {...props}
                />
              )}
              exact
            />
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="home/report" href="/home/report">
              <IonIcon icon={homeOutline} />
              <IonLabel>
                <T>Home</T>
              </IonLabel>
            </IonTabButton>

            <IonTabButton tab="home/species" href="/home/species">
              <IonIcon icon={bookOutline} />
              <IonLabel>
                <T>Guide</T>
              </IonLabel>
            </IonTabButton>

            <IonTabButton>
              <LongPressFabButton
                onClick={this.navigateToPrimarySurvey}
                icon={addOutline}
              >
                <IonFabList side="top">
                  {getOtherSurveys()}

                  <div className="long-press-surveys-label">
                    <T>Click on other recording options from list below</T>
                  </div>
                </IonFabList>
              </LongPressFabButton>
            </IonTabButton>

            <IonTabButton tab="/home/user-surveys" href="/home/user-surveys">
              <IonIcon icon={personOutline} />
              <IonLabel>
                <T>Surveys</T>
              </IonLabel>
              <PendingSurveysBadge savedSamples={savedSamples} />
            </IonTabButton>

            <IonTabButton tab="menu" href="/home/menu">
              <IonIcon icon={menuOutline} />
              <IonLabel>
                <T>Menu</T>
              </IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </>
    );
  }
}

export default Component;
