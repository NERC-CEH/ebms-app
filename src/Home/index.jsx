import * as React from 'react';
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
import savedSamples from 'models/collections/samples';
import appModel from 'models/app';
import userModel from 'models/user';
import LongPressFabButton from 'Components/LongPressFabButton';
import { Trans as T } from 'react-i18next';
import PendingSurveysBadge from 'common/Components/PendingSurveysBadge';
import surveys from 'common/config/surveys';
import Report from './Report';
import Species from './Species';
import UserSurveys from './UserSurveys';
import Menu from './Menu';
import './styles.scss';

const UserSurveysTab = () => <UserSurveys savedSamples={savedSamples} />;
const ReportTab = props => <Report appModel={appModel} {...props} />;
const SpeciesTab = () => (
  <Species
    appModel={appModel}
    userModel={userModel}
    savedSamples={savedSamples}
  />
);

class Component extends React.Component {
  static contextType = NavContext;

  navigateToPrimarySurvey = () => {
    const primarySurveyName = appModel.attrs.primarySurvey || 'precise-area';

    this.context.navigate(`/survey/${primarySurveyName}`);
  };

  render() {
    const primarySurveyName = appModel.attrs.primarySurvey || 'precise-area';

    const getOtherSurveys = () => {
      const primarySurvey = ({ name }) => name !== primarySurveyName;
      const otherSurveys = Object.values(surveys).filter(primarySurvey);

      // eslint-disable-next-line
      const getSurveyButton = ({ name, label }) => {
        if (name === 'area') return null; // for backwards compatible

        return (
          <IonFabButton
            class="fab-button-label"
            routerLink={`/survey/${name}`}
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
            <Route path="/home/report" render={ReportTab} exact />
            <Route path="/home/species" render={SpeciesTab} exact />
            <Route path="/home/user-surveys" render={UserSurveysTab} exact />
            <Route path="/home/menu" component={Menu} exact />
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
