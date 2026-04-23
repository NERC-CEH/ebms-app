/* eslint-disable no-param-reassign */
import { observer } from 'mobx-react';
import { Block, BlockContext, Header, InfoMessage, Main } from '@flumens';
import { IonList } from '@ionic/react';
import {
  Lamp,
  mothTrapLampDescriptionAttr,
  mothTrapLampQuantityAttr,
  mothTrapLampTypeAttr,
  mothTrapLampTypeNameAttr,
} from './config';

type Props = { lamp: Lamp };

const LampDetails = ({ lamp }: Props) => {
  const onTypeChange = (val: string) => {
    lamp[mothTrapLampTypeAttr.id] = val;

    const choice = mothTrapLampTypeAttr.choices.find(c => c.dataName === val);
    lamp[mothTrapLampTypeNameAttr.id] = choice?.title || '';
  };

  return (
    <>
      <Header title="Lamp details" />

      <Main>
        <BlockContext value={{ isDisabled: false }}>
          <IonList lines="full">
            <div className="rounded-list">
              <Block
                block={mothTrapLampTypeAttr}
                record={lamp}
                onChange={onTypeChange}
              />
              <Block block={mothTrapLampQuantityAttr} record={lamp} />
              <Block block={mothTrapLampDescriptionAttr} record={lamp} />
              <InfoMessage>Additional description of lamp.</InfoMessage>
            </div>
          </IonList>
        </BlockContext>
      </Main>
    </>
  );
};

export default observer(LampDetails);
