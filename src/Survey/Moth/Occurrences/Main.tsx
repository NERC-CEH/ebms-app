import React, { FC } from 'react';
import Sample from 'models/sample';
import {
  Main,
  MenuAttrItem,
  InfoBackgroundMessage as InfoMessage,
} from '@apps';
import { IonList, IonItemDivider } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import Occurrence from 'models/occurrence';
import { observer } from 'mobx-react';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import mothIcon from 'common/images/moth.svg';
import SpeciesEntry from './Components/SpeciesEntry';
import './styles.scss';

interface Props {
  match: any;
  sample: typeof Sample;
  deleteSpecies: any;
}

const OccurrencesMain: FC<Props> = ({ sample, match, deleteSpecies }) => {
  const { taxa } = match.params;

  const selectedTaxon = (occurrence: typeof Occurrence) => {
    return occurrence.attrs.taxon.warehouse_id === parseInt(taxa, 10);
  };

  const species = sample.occurrences.filter(selectedTaxon);

  const getSpeciesList = () => {
    const getSpeciesEntry = (occurrence: typeof Occurrence) => (
      <SpeciesEntry
        key={occurrence.cid}
        occurrence={occurrence}
        deleteSpecies={deleteSpecies}
      />
    );

    const speciesList = species.map(getSpeciesEntry);

    return (
      <>
        <IonItemDivider>
          <T>Moths list</T>
        </IonItemDivider>
        {speciesList}

        <InfoBackgroundMessage name="showSurveysDeleteTip">
          To delete any species swipe it to the left.
        </InfoBackgroundMessage>
      </>
    );
  };

  if (!species.length) {
    return (
      <Main id="area-count-occurrence-edit">
        <IonList id="list" lines="full">
          <InfoMessage>No species added</InfoMessage>
        </IonList>
      </Main>
    );
  }

  return (
    <Main>
      <IonList lines="full">
        <div className="rounded">
          <MenuAttrItem
            routerLink={`${match.url}/taxon`}
            icon={mothIcon}
            label="Species"
            value={species[0].getTaxonName()}
          />
        </div>

        {getSpeciesList()}
      </IonList>
    </Main>
  );
};

export default observer(OccurrencesMain);
