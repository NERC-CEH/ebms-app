import React, { FC, useContext } from 'react';
import Sample from 'models/sample';
import { Main, MenuAttrItem } from '@apps';
import {
  IonList,
  IonButton,
  IonIcon,
  IonLabel,
  NavContext,
} from '@ionic/react';
import { Trans as T } from 'react-i18next';
import { observer } from 'mobx-react';
import './styles.scss';

import { locationOutline, addCircleOutline } from 'ionicons/icons';

type Props = {
  match: any;
  sample: typeof Sample;
};

const HomeMain: FC<Props> = ({ match, sample }) => {
  const { navigate } = useContext(NavContext);

  const getSpeciesAddButton = () => {
    const onClick = () => {
      navigate(`/survey/moth/${sample.cid}/taxon`);
    };

    return (
      <IonButton color="primary" className="add" onClick={onClick}>
        <IonIcon icon={addCircleOutline} slot="start" />
        <IonLabel>
          <T>Add species</T>
        </IonLabel>
      </IonButton>
    );
  };

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

        {getSpeciesAddButton()}
      </IonList>
    </Main>
  );
};

export default observer(HomeMain);
