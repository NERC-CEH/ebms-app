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
    <IonContent id="credits" class="ion-padding">
      <IonList lines="none">
        <IonListHeader color="light" mode="ios">
          <IonLabel>
            {t(
              'We are very grateful for all the people that helped to create this app:'
            )}
          </IonLabel>
        </IonListHeader>
        <IonItem>
          <ul>
            <li>
              <a href="https://kazlauskis.com">
                <b>Karolis Kazlauskis</b>
                {' '}
(App developer)
              </a>
            </li>
            <li>
              <a href="https://www.ceh.ac.uk/staff/david-roy">
                <b>David Roy</b>
                {' '}
(the Centre for Ecology & Hydrology)
              </a>
            </li>
            <li>
              <b>Cristina Sevilleja</b>
              {' '}
(Dutch Butterfly Conservation)
            </li>
            <li>
              <b>Chris van Swaay</b>
              {' '}
(Dutch Butterfly Conservation, Butterfly
              Conservation Europe)
            </li>
            <li>
              <b>Irma van Swaay</b>
              {' '}
(Dutch Butterfly Conservation, Butterfly
              Conservation Europe)
            </li>
            <li>
              <b>Martin Warren</b>
              {' '}
(Butterfly Conservation Europe)
            </li>
          </ul>
        </IonItem>

        <IonListHeader color="light" mode="ios">
          <IonLabel>
            {t(
              'The app was developed as part of the Assessing Butterflies in Europe (ABLE) project.'
            )}
          </IonLabel>
        </IonListHeader>

        <IonItem>
          <p>
            {t(`The ABLE project is a partnership between`)}
            {' '}
            <a href="http://www.bc-europe.eu/">Butterfly Conservation Europe</a>
            ,
            {' '}
            <a href="www.ceh.ac.uk">
              the Centre for Ecology and Hydrology (UK)
            </a>
            ,
            {' '}
            <a href="https://www.ufz.de/index.php">
              the Helmholtz Centre for Environmental Research (UFZ, Germany) -
              Josef Settele, Oliver Schweiger
            </a>
            ,
            {' '}
            <a href="https://www.vlinderstichting.nl/">
              Dutch Butterfly Conservation
            </a>
            {' '}
            {t('and')}
            {' '}
            <a href="https://butterfly-conservation.org/">
              Butterfly Conservation (UK)
            </a>
            .
            {' '}
          </p>
        </IonItem>
        <IonItem>
          <p>
            {t(
              `ABLE is funded by a service contract from the European Union Directorate for the Environment, for an initial period of two years from 2019-20.`
            )}
          </p>
        </IonItem>
        <IonItem>
          <p>
            <u>{t(`ABLE partners:`)}</u>
          </p>
        </IonItem>
        <IonItem>
          <ul>
            <li>
              <b>Butterfly Conservation Europe</b>
              {' '}
– Sue Collins, Martin Warren
            </li>
            <li>
              <b>Centre for Ecology and Hydrology (CEH, UK)</b>
              {' '}
– David Roy,
              Reto Schmucki
            </li>
            <li>
              <b>Sub-contracts to CEH</b>
: Karolis Kazlauskis (App development),
              Gary van Breda (Website development), John van Breda (Website
              development)
            </li>
            <li>
              <b>
                Dutch Butterfly Conservation, De Vlinderstichting (Netherlands)
              </b>
              {' '}
              – Chris van Swaay, Cristina Sevilleja, Irma Wynhoff
            </li>
            <li>
              <b>Helmholtz Centre for Environmental Research (UFZ, Germany)</b>
            </li>
            <li>
              <b>Butterfly Conservation UK</b>
              {' '}
– Nigel Bourn, Emily Dennis
            </li>
          </ul>
        </IonItem>

        <IonListHeader color="light" mode="ios">
          <IonLabel>
            {t(
              'This app contributes data to the European Butterfly Monitoring Scheme (eBMS).'
            )}
          </IonLabel>
        </IonListHeader>

        <IonItem>
          <p>
            {t(
              `In June 2019, the following organisations are partners in eBMS:`
            )}
          </p>
        </IonItem>
        <IonItem>
          <ul>
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
                Szalkay Hungarian Lepidopterists
                {"'"}
                {' '}
Society
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
          <img src="/images/sponsors.png" alt="" />
        </IonItem>
      </IonList>
    </IonContent>
  </>
);
