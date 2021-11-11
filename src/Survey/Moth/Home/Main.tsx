import React, { FC, useContext } from 'react';
import Sample from 'models/sample';
import { Main, MenuAttrItem, InfoBackgroundMessage } from '@apps';
import {
  IonList,
  IonButton,
  IonIcon,
  IonLabel,
  NavContext,
  IonItemDivider,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import { Trans as T } from 'react-i18next';
import { observer } from 'mobx-react';
import Occurrence from 'models/occurrence';
import { toJS } from 'mobx';
import { locationOutline } from 'ionicons/icons';
import './styles.scss';

const getDefaultTaxonCount = (taxon: any) => ({ count: 0, taxon });

const buildSpeciesCount = (agg: any, occ: typeof Occurrence) => {
  const taxon = toJS(occ.attrs.taxon);
  const id = taxon.warehouse_id;

  agg[id] = agg[id] || getDefaultTaxonCount(taxon); // eslint-disable-line

  agg[id].count++; // eslint-disable-line

  return agg;
};

type Props = {
  match: any;
  sample: typeof Sample;
  increaseCount: any;
  deleteSpecies: any;
  isDisabled: boolean;
};

const HomeMain: FC<Props> = ({
  match,
  sample,
  increaseCount,
  deleteSpecies,
  isDisabled,
}) => {
  const { navigate } = useContext(NavContext);

  const getSpeciesAddButton = () => {
    const onClick = () => {
      navigate(`/survey/moth/${sample.cid}/taxon`);
    };

    return (
      <IonButton color="primary" className="add" onClick={onClick}>
        <IonLabel>
          <T>Add species</T>
        </IonLabel>
      </IonButton>
    );
  };

  const getSpeciesEntry = ([id, species]: any) => {
    const isSpeciesDisabled = !species.count;
    const { taxon } = species;

    const speciesName = taxon[taxon.found_in_name];

    const increaseCountWrap = (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      increaseCount(taxon);
    };

    const deleteSpeciesWrap = () => deleteSpecies(taxon);

    const navigateToSpeciesOccurrences = () => {
      navigate(`${match.url}/occurrences/${taxon.warehouse_id}`);
    };

    return (
      <IonItemSliding key={id}>
        <IonItem
          onClick={navigateToSpeciesOccurrences}
          detail={!isSpeciesDisabled}
        >
          <IonButton
            className="precise-area-count-edit-count"
            onClick={increaseCountWrap}
            fill="clear"
          >
            {species.count}
            <div className="label-divider" />
          </IonButton>
          <IonLabel>{speciesName}</IonLabel>
        </IonItem>
        {!isDisabled && (
          <IonItemOptions side="end">
            <IonItemOption color="danger" onClick={deleteSpeciesWrap}>
              <T>Delete</T>
            </IonItemOption>
          </IonItemOptions>
        )}
      </IonItemSliding>
    );
  };

  const getSpeciesList = () => {
    if (!sample.occurrences.length) {
      return (
        <IonList id="list" lines="full">
          <InfoBackgroundMessage>No species added</InfoBackgroundMessage>
        </IonList>
      );
    }

    const counts = [...sample.occurrences].reduce(buildSpeciesCount, {});

    const speciesList = Object.entries(counts).map(getSpeciesEntry);

    const count = speciesList.length > 1 ? speciesList.length : null;

    return (
      <>
        <IonList id="list" lines="full">
          <div className="rounded">
            <IonItemDivider className="species-list-header">
              <IonLabel>Count</IonLabel>
              <IonLabel>Species</IonLabel>
              <IonLabel>{count}</IonLabel>
            </IonItemDivider>

            {speciesList}
          </div>
        </IonList>
      </>
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

        {getSpeciesList()}
      </IonList>
    </Main>
  );
};

export default observer(HomeMain);
