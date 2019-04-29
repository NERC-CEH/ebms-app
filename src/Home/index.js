import React, { useState } from 'react';
import {
  IonTabs,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonPage,
  IonPopover,
} from '@ionic/react';
import { Route, Redirect } from 'react-router-dom';
import PrivateRoute from 'common/Components/PrivateRoute';
import Report from './Report';
import Guide from '../Info/Guide';
import User from '../User/Report';
import './styles.scss';

const selectSurvey = (
  <small style={{ padding: '30px' }}>
    <center>TODO: implement</center>
  </small>
);

const Component = () => {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <>
      <IonPopover
        isOpen={showPopover}
        onDidDismiss={() => {
          setShowPopover(false);
        }}
      >
        {selectSurvey}
      </IonPopover>

      <IonPage className="app-home-page">
        <Route exact path="/" render={() => <Redirect to="/home/report" />} />

        <IonTabs>
          <IonRouterOutlet>
            <Route path="/:tab(home/report)" component={Report} exact />
            <Route path="/:tab(home/guide)" component={Guide} exact />
            <Route
              path="/:tab(home/user-report)"
              render={() => <PrivateRoute component={User} />}
              exact
            />
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/home/report">
              <IonIcon name="home" />
              <IonLabel>Home</IonLabel>
            </IonTabButton>
            <IonTabButton tab="guide" href="/home/guide">
              <IonIcon name="book" />
              <IonLabel>Guide</IonLabel>
            </IonTabButton>
            <IonTabButton
              class="add-survey"
              onClick={() => setShowPopover(true)}
            >
              <IonIcon name="add" />
            </IonTabButton>
            <IonTabButton tab="user" href="/home/user-report">
              <IonIcon name="person" />
              <IonLabel>Account</IonLabel>
            </IonTabButton>
            <IonTabButton tab="menu" href="/info/menu">
              <IonIcon name="menu" />
              <IonLabel>Menu</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonPage>
    </>
  );
};

Component.propTypes = {};

export default Component;
