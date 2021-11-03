import React, { FC } from 'react';
import { Main, MenuAttrItemFromModel } from '@apps';
import Sample from 'models/sample';
import { IonList, IonItemDivider } from '@ionic/react';
import { observer } from 'mobx-react';

type Props = {
  sample: typeof Sample;
};

const DetailsMain: FC<Props> = ({ sample }) => {
  return (
    <Main>
      <IonList lines="full">
        <IonItemDivider>Details</IonItemDivider>
        <div className="rounded">
          <MenuAttrItemFromModel model={sample} attr="method" />
          <MenuAttrItemFromModel model={sample} attr="recorder" />
          <MenuAttrItemFromModel model={sample} attr="comment" />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(DetailsMain);
