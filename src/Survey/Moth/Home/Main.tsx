import React, { FC } from 'react';
import { Main, MenuAttrItem } from '@apps';
import { IonList } from '@ionic/react';
import { observer } from 'mobx-react';
import { locationOutline } from 'ionicons/icons';

type Props = {
  match: any;
};

const HomeMain: FC<Props> = ({ match }) => {
  return (
    <Main>
      <IonList lines="full">
        <div className="rounded">
          <MenuAttrItem
            routerLink={`${match.url}/edit`}
            icon={locationOutline}
            label="Survey Details"
          />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(HomeMain);
