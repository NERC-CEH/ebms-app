/* eslint-disable no-param-reassign */
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { Block, InfoMessage, Main, BlockContext } from '@flumens';
import { IonList } from '@ionic/react';
import {
  Lamp,
  mothTrapLampDescriptionAttr,
  mothTrapLampQuantityAttr,
  mothTrapLampTypeAttr,
  mothTrapLampTypeNameAttr,
} from 'models/location';
import './styles.scss';

type Props = {
  lamp: Lamp;
};

const MothTrapLampMain = ({ lamp }: Props) => (
  <Main>
    <BlockContext value={{ isDisabled: false }}>
      <IonList lines="full">
        <h3 className="list-title">
          <T>Lamp Details</T>
        </h3>

        <div className="rounded-list">
          <Block
            block={mothTrapLampTypeAttr}
            record={lamp.data}
            onChange={(val: any) => {
              const byId = (choice: any) => choice.dataName === val;
              const choice = mothTrapLampTypeAttr.choices.find(byId);
              lamp.data[mothTrapLampTypeAttr.id] = val;
              lamp.data[mothTrapLampTypeNameAttr.id] = choice?.title || '';
              return null;
            }}
          />
          <Block block={mothTrapLampQuantityAttr} record={lamp.data} />
          <Block block={mothTrapLampDescriptionAttr} record={lamp.data} />
          <InfoMessage>Additional description of lamp.</InfoMessage>
        </div>
      </IonList>
    </BlockContext>
  </Main>
);

export default observer(MothTrapLampMain);
