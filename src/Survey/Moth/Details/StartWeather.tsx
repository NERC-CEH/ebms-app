import { FC } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, Main, MenuAttrItemFromModel } from '@flumens';
import { IonList } from '@ionic/react';
import Sample from 'models/sample';

type Props = {
  sample: Sample;
};

const StartWeather: FC<Props> = ({ sample }) => {
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
