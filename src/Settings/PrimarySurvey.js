import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import {
  IonList,
  IonItem,
  IonRadioGroup,
  IonRadio,
  IonLabel,
} from '@ionic/react';
import Page from 'Lib/Page';
import Main from 'Lib/Main';
import surveys from 'common/config/surveys';
import Header from '@bit/flumens.apps.header';

function SelectCountry({ appModel }) {
  const currentValue = appModel.attrs.primarySurvey;

  function onSelect(e) {
    const survey = e.target.value;
    appModel.attrs.primarySurvey = survey; // eslint-disable-line no-param-reassign
    appModel.save();
  }

  const translate = ({ name, label }) => [name, t(label)];

  const surveyOptions = Object.values(surveys)
    .map(translate)
    .map(([value, label]) => (
      <React.Fragment key={value}>
        <IonItem>
          <IonLabel>{label}</IonLabel>
          <IonRadio value={value} checked={currentValue === value} />
        </IonItem>
      </React.Fragment>
    ));

  return (
    <Page id="primary-survey">
      <Header title="All Surveys" />

      <Main>
        <IonList>
          <IonRadioGroup onIonChange={onSelect}>{surveyOptions}</IonRadioGroup>
        </IonList>
      </Main>
    </Page>
  );
}

SelectCountry.propTypes = {
  appModel: PropTypes.object.isRequired,
};

export default observer(SelectCountry);
