import React from 'react';
import {
  IonContent,
  IonList,
  IonItem,
  IonListHeader,
  IonLabel,
} from '@ionic/react';
import AppHeader from 'common/Components/Header';
import './sponsors.png';
import './styles.scss';

export default () => (
  <>
    <AppHeader title={t('Credits')} />
    <IonContent class="ion-padding">
      <IonList>
        <IonListHeader>
          <IonLabel>
            {t(
              'We are very grateful for all the people that helped to create this app:'
            )}
          </IonLabel>
        </IonListHeader>
        <IonItem>
          <ul className="credits-list">
            <li>
              <a href="https://kazlauskis.com">
                Karolis Kazlauskis (App developer)
              </a>
            </li>
            <li>
              <a href="https://www.ceh.ac.uk/staff/david-roy">
                David Roy (the Centre for Ecology & Hydrology)
              </a>
            </li>
            <li>Cristina Sevilleja (Dutch Butterfly Conservation)</li>
            <li>
              Chris van Swaay (Dutch Butterfly Conservation, Butterfly
              Conservation Europe)
            </li>
            <li>
              Irma van Swaay (Dutch Butterfly Conservation, Butterfly
              Conservation Europe)
            </li>
            <li>Martin Warren (Butterfly Conservation Europe)</li>
          </ul>
        </IonItem>
      </IonList>

      <IonList>
        <IonListHeader>
          <IonLabel>
            {t(
              'The app was developed as part of the Assessing Butterflies in Europe (ABLE) project.'
            )}
          </IonLabel>
        </IonListHeader>

        <IonItem>
          {t(`The ABLE project is a partnership between Butterfly Conservation
            Europe, the Centre for Ecology and Hydrology (UK), the Helmholtz
            Centre for Environmental Research (UFZ, Germany), Dutch Butterfly
            Conservation and Butterfly Conservation (UK). ABLE is funded by a
            service contract from the European Union Directorate for the
            Environment, for an initial period of two years from 2019-20.`)}
        </IonItem>
        <IonItem>{t(`ABLE partners:`)}</IonItem>
        <IonItem>
          <ul className="credits-list">
            <li>Butterfly Conservation Europe – Sue Collins, Martin Warren</li>
            <li>
              Centre for Ecology and Hydrology (CEH, UK) – David Roy, Reto
              Schmucki
            </li>
            <li>
              Sub-contracts to CEH: Karolis Kazlauskis (App development), Gary
              van Breda (Website development), John van Breda (Website
              development)
            </li>
            <li>
              Dutch Butterfly Conservation, De Vlinderstichting (Netherlands) –
              Chris van Swaay, Cristina Sevilleja, Irma Wynhoff
            </li>
            <li>Helmholtz Centre for Environmental Research (UFZ, Germany)</li>
            <li>Butterfly Conservation UK – Nigel Bourn, Emily Dennis</li>
          </ul>
        </IonItem>
      </IonList>

      <IonList>
        <IonListHeader>
          <IonLabel>
            {t(
              'This app contributes data to the European Butterfly Monitoring Scheme (eBMS).'
            )}
          </IonLabel>
        </IonListHeader>

        <IonItem>
          {t(`In June 2019, the following organisations are partners in eBMS:`)}
        </IonItem>
        <IonItem>
          <ul className="credits-list">
            <li>
              <b>NERC-CEH</b>
, CEH, David Roy
            </li>
            <li>
              <b>Butterfly Conservation, UK </b>
, BC UK, Ian Middlebrook
            </li>
            <li>
              <b>Helmholtz-Zentrum für Umweltforschung GmbH - UFZ</b>
, UFZ,
              Josef Settele
            </li>
            <li>
              <b>De Vlinderstichting</b>
, Dutch BC, Chris van Swaay
            </li>
            <li>
              <b>Catalonia BMS</b>
, Catalonia BMS, Constanti Stefanescu
            </li>
            <li>
              <b>Finnish Environment Institute</b>
, SYKE, Mikko Kuussaari
            </li>
            <li>
              <b>Butterfly Conservation Europe</b>
, BCE, Chris van Swaay
            </li>
            <li>
              <b>Flanders Butterfly Monitoring Scheme</b>
, Flanders BMS, Dirk
              Maes
            </li>
            <li>
              <b>Centre des Sciences de la Conservation</b>
, French BMS, Benoît
              Fontaine
            </li>
            <li>
              <b>National Biodiversity Data Centre</b>
, Ireland BMS, Tomás
              Murray
            </li>
            <li>
              <b>Swedish Butterfly Monitoring Scheme</b>
, SEBMS, Lars Pettersson
            </li>
            <li>
              <b>Luxembourg Institute of Science and Technology</b>
, Luxembourg
              BMS, Xavier Mestdagh
            </li>
            <li>
              <b>ZERYNTHIA Association</b>
, ZERYNTHIA-Spain BMS, Yeray León
            </li>
            <li>
              <b>Butterfly Monitoring Scheme</b>
, Spain BMS, España Miguel
              Munguira
            </li>
            <li>
              <b>Društvo za Proučevanje in Ohranjanje Metuljev Slovenije</b>
,
              Slovenia BMS, Rudi Verovnik
            </li>
            <li>
              <b>
                Hungarian Lepidoptera Monitoring Network as part of the Jozsef
                Szalkay Hungarian Lepidopterists' Society
              </b>
              , Hungary BMS, András Szabadfalvi
              {' '}
            </li>
            <li>
              <b>
                Zoolab Department of Life Sciences and Systems Biology
                University of Turin
              </b>
              , Italy BMS, Simona Bonelli
            </li>
            <li>
              <b>TAGIS - Centro de Conservacao des Borboletas de Portugal</b>
,
              Portugal BMS, Eva Monteiro
            </li>
          </ul>
        </IonItem>
        <IonItem>
          <img src="images/sponsors.png" alt="" />
        </IonItem>
      </IonList>
    </IonContent>
  </>
);
