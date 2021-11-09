import React, { FC } from 'react';
import Sample from 'models/sample';
import { Main, MenuAttrItem } from '@apps';
import { IonList } from '@ionic/react';
import Occurrence from 'models/occurrence';
import { observer } from 'mobx-react';
import butterflyIcon from 'common/images/butterfly.svg';
import './styles.scss';

interface Props {
  match: any;
  sample: typeof Sample;
}

const OccurrencesMain: FC<Props> = ({ sample, match }) => {
  const { taxa } = match.params;

  const selectedTaxon = (occurrence: typeof Occurrence) => {
    return occurrence.attrs.taxon.warehouse_id === parseInt(taxa, 10);
  };

  const species = sample.occurrences.find(selectedTaxon);

  if (!species) return null;

  return (
    <Main>
      <IonList lines="full">
        <div className="rounded">
          <MenuAttrItem
            routerLink={`${match.url}/taxon`}
            icon={butterflyIcon}
            label="Species"
            value={species.getTaxonName()}
          />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(OccurrencesMain);
