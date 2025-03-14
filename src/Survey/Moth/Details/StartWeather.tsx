import { observer } from 'mobx-react';
import { Page, Header, Main, MenuAttrItemFromModel, useSample } from '@flumens';
import { IonList } from '@ionic/react';
import Sample from 'models/sample';

const StartWeather = () => {
  const { sample } = useSample<Sample>();
  if (!sample) return null;

  return (
    <Page id="moth-trap-start-weather">
      <Header title="Start Weather" />
      <Main>
        <IonList lines="full">
          <div className="rounded-list">
            <MenuAttrItemFromModel model={sample} attr="temperature" />
            <MenuAttrItemFromModel model={sample} attr="direction" />
            <MenuAttrItemFromModel model={sample} attr="wind" />
            <MenuAttrItemFromModel
              model={sample}
              attr="moon"
              className="moonIcon"
              skipValueTranslation
            />
            <MenuAttrItemFromModel model={sample} attr="cloud" />
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(StartWeather);
