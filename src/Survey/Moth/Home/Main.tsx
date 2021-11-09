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
import { locationOutline, addCircleOutline } from 'ionicons/icons';
import './styles.scss';

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
        <IonIcon icon={addCircleOutline} slot="start" />
        <IonLabel>
          <T>Add species</T>
        </IonLabel>
      </IonButton>
    );
  };

  const getSpeciesEntry = (occurrence: typeof Occurrence) => {
    const { cid } = occurrence;
    const { taxon, count } = occurrence.attrs;

    const speciesName = taxon.scientific_name;

    const increaseCountWrap = (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      increaseCount(occurrence);
    };

    const deleteSpeciesWrap = () => deleteSpecies(occurrence);

    const navigateToSpeciesOccurrences = () => {
      navigate(`${match.url}/occurrences/${taxon.warehouse_id}`);
    };

    return (
      <IonItemSliding key={cid}>
        <IonItem detail={!isDisabled} onClick={navigateToSpeciesOccurrences}>
          <IonButton
            className="precise-area-count-edit-count"
            onClick={increaseCountWrap}
            fill="clear"
          >
            {count}
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

    const speciesList = sample.occurrences.map(getSpeciesEntry);

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
