import React, { FC } from 'react';
import Occurrence from 'models/occurrence';
import {
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import { MatchParams } from 'common/types';
import { useRouteMatch } from 'react-router';
import SpeciesInfo from './SpeciesInfo';

interface Props {
  occurrence: typeof Occurrence;
  deleteSpecies: any;
}

const SpeciesEntry: FC<Props> = ({ occurrence, deleteSpecies }) => {
  const match: MatchParams = useRouteMatch();
  const { taxa } = match.params;
  const deleteSpeciesWrap = () => deleteSpecies(occurrence);
  const isDisabled = occurrence.isDisabled();

  const path = match.url.replace(taxa, 'occ');
  const url = `${path}/${occurrence.cid}`;

  return (
    <div className="rounded" key={occurrence.cid}>
      <IonItemSliding className="species">
        <IonItem routerLink={url} detail>
          <SpeciesInfo occurrence={occurrence} />
        </IonItem>

        {!isDisabled && (
          <IonItemOptions side="end" onClick={deleteSpeciesWrap}>
            <IonItemOption color="danger">Delete</IonItemOption>
          </IonItemOptions>
        )}
      </IonItemSliding>
    </div>
  );
};

export default SpeciesEntry;
