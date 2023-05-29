import { FC } from 'react';
import { Page, Header, Main, MenuAttrItemFromModel } from '@flumens';
import Sample from 'models/sample';
import { IonList } from '@ionic/react';
import { observer } from 'mobx-react';

type Props = {
  sample: Sample;
};

const EndWeather: FC<Props> = ({ sample }) => {
  return (
    <Page id="moth-trap-end-weather">
      <Header title="End Weather" />
      <Main>
        <IonList lines="full">
          <div className="rounded">
            <MenuAttrItemFromModel model={sample} attr="temperatureEnd" />
            <MenuAttrItemFromModel model={sample} attr="directionEnd" />
            <MenuAttrItemFromModel model={sample} attr="windEnd" />
            <MenuAttrItemFromModel model={sample} attr="moonEnd" />
            <MenuAttrItemFromModel model={sample} attr="cloudEnd" />
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(EndWeather);
