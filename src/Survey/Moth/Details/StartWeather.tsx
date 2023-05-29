import { FC } from 'react';
import { Page, Header, Main, MenuAttrItemFromModel } from '@flumens';
import Sample from 'models/sample';
import { IonList } from '@ionic/react';
import { observer } from 'mobx-react';

type Props = {
  sample: Sample;
};

const StartWeather: FC<Props> = ({ sample }) => {
  return (
    <Page id="moth-trap-start-weather">
      <Header title="Start Weather" />
      <Main>
        <IonList lines="full">
          <div className="rounded">
            <MenuAttrItemFromModel model={sample} attr="temperature" />
            <MenuAttrItemFromModel model={sample} attr="direction" />
            <MenuAttrItemFromModel model={sample} attr="wind" />
            <MenuAttrItemFromModel model={sample} attr="moon" />
            <MenuAttrItemFromModel model={sample} attr="cloud" />
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(StartWeather);
