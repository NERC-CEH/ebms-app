import React, { FC, useContext } from 'react';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import { Main, MenuAttrItem, InfoBackgroundMessage } from '@apps';
import {
  IonList,
  IonButton,
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
import { locationOutline } from 'ionicons/icons';
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
  const disabled = sample.isUploaded();

  const getSpeciesAddButton = () => {
    const onClick = () => {
      navigate(`/survey/moth/${sample.cid}/taxon`);
    };

    if (disabled) return null;

    return (
      <IonButton color="primary" className="add" onClick={onClick}>
        <IonLabel>
          <T>Add species</T>
        </IonLabel>
      </IonButton>
    );
  };

  const getSpeciesEntry = (occ: typeof Occurrence) => {
    const speciesName = occ.getTaxonName();
    const speciesCount = occ.attrs.count;

    const increaseCountWrap = (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      increaseCount(occ);
    };

    const deleteSpeciesWrap = () => deleteSpecies(occ);

    const navigateToSpeciesOccurrences = () => {
      navigate(`${match.url}/occ/${occ.cid}`);
    };

    return (
      <IonItemSliding key={occ.cid}>
        <IonItem onClick={navigateToSpeciesOccurrences} detail={!disabled}>
          <IonButton
            className="precise-area-count-edit-count"
            onClick={increaseCountWrap}
            fill="clear"
          >
            {speciesCount}
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
