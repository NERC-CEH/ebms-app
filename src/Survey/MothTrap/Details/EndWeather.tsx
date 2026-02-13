import { observer } from 'mobx-react';
import { Page, Header, Main, MenuAttrItemFromModel, useSample } from '@flumens';
import { IonList } from '@ionic/react';
import Sample from 'models/sample';

const EndWeather = () => {
  const { sample } = useSample<Sample>();
  if (!sample) return null;

  return (
    <Page id="moth-trap-end-weather">
      <Header title="End Weather" />
      <Main>
        <IonList lines="full">
          <div className="rounded-list">
            <MenuAttrItemFromModel model={sample} attr="temperatureEnd" />
            <MenuAttrItemFromModel model={sample} attr="directionEnd" />
            <MenuAttrItemFromModel model={sample} attr="windEnd" />
            <MenuAttrItemFromModel
              model={sample}
              attr="moonEnd"
              className="moonIcon"
              skipValueTranslation
            />
            <MenuAttrItemFromModel model={sample} attr="cloudEnd" />
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(EndWeather);
