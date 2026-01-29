import { Fragment, useContext } from 'react';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { Page, Main, Header } from '@flumens';
import {
  IonList,
  IonItem,
  IonRadioGroup,
  IonRadio,
  IonLabel,
  NavContext,
} from '@ionic/react';
import { surveyConfigs as surveys } from 'common/models/sample';
import appModel from 'models/app';

function SelectCountry() {
  const currentValue = appModel.data.primarySurvey;
  const { t } = useTranslation();
  const { goBack } = useContext(NavContext);

  function onSelect(e: any) {
    const survey = e.target.value;
    appModel.data.primarySurvey = survey;
    appModel.save();
    goBack();
  }

  const translate = ({ name, label }: any) => [name, t(label)];

  const surveyOption = ([value, label]: any) => {
    if (value === 'area') return null; // for backwards compatible

    return (
      <Fragment key={value}>
        <IonItem>
          <IonRadio value={value}>
            <IonLabel>{label}</IonLabel>
          </IonRadio>
        </IonItem>
      </Fragment>
    );
  };
  const surveyOptions = Object.values(surveys).map(translate).map(surveyOption);

  return (
    <Page id="primary-survey">
      <Header title="All Surveys" />

      <Main>
        <IonList>
          <IonRadioGroup onIonChange={onSelect} value={currentValue}>
            {surveyOptions}
          </IonRadioGroup>
        </IonList>
      </Main>
    </Page>
  );
}

export default observer(SelectCountry);
