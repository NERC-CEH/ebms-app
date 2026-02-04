import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { Page, Main, Header, RadioInput } from '@flumens';
import { NavContext } from '@ionic/react';
import { surveyConfigs as surveys } from 'common/models/sample';
import appModel from 'models/app';
import { Survey } from 'Survey/common/config';

function SelectCountry() {
  const currentValue = appModel.data.primarySurvey;
  const { t } = useTranslation();
  const { goBack } = useContext(NavContext);

  const onSelect = (survey: string) => {
    appModel.data.primarySurvey = survey;
    appModel.save();
    goBack();
  };

  const translate = ({ name, label }: Survey) => ({
    value: name,
    label: t(label || name),
  });

  const surveyOptions = Object.values(surveys)
    .map(translate)
    .filter(({ value }) => value !== 'area'); // for backwards compatible

  return (
    <Page id="primary-survey">
      <Header title="All Surveys" />

      <Main className="[--padding-top:30px]">
        <RadioInput
          onChange={onSelect}
          value={currentValue}
          platform="ios"
          skipTranslation
        >
          {surveyOptions.map(({ value, label }) => (
            <RadioInput.Option key={value} value={value} label={label} />
          ))}
        </RadioInput>
      </Main>
    </Page>
  );
}

export default observer(SelectCountry);
