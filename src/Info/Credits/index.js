import React from 'react';
import { IonContent } from '@ionic/react';
import AppHeader from 'common/Components/Header';
import './sponsor_logo.svg';

export default () => (
  <>
    <AppHeader title="Credits" />
    <IonContent class="ion-padding">
      <ion-list lines="none">
        <ion-list-item>
          <img src="images/sponsor_logo.svg" alt="" />
        </ion-list-item>
        <ion-list-item>
          <p>
            <strong>
              We are very grateful for all the people that helped to create this
              app:
            </strong>
          </p>
          <ul style={{ listStyleType: 'none' }}>
            <small>TODO: add everyone to the list</small>
            {/* <li>
                  <a href="https://www.ceh.ac.uk/staff/david-roy">
                    David Roy (CEH)
                  </a>
                </li>
                <li>
                  <a href="https://kazlauskis.com">Karolis Kazlauskis</a>
                </li> */}
          </ul>
        </ion-list-item>
      </ion-list>
    </IonContent>
  </>
);
