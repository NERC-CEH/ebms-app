import React, { FC, useContext } from 'react';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import { Main, MenuAttrItem, InfoBackgroundMessage, alert } from '@apps';
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
import clsx from 'clsx';
import { locationOutline, camera, warningOutline } from 'ionicons/icons';
import { UNKNOWN_SPECIES } from 'Survey/Moth/config';
import UnidentifiedSpeciesEntry from './Components/UnidentifiendSpeciesEntry';
import AnimatedNumber from './Components/AnimatedNumber';
import './styles.scss';

const shownDisabledImageIdentifierAlert = () =>
  alert({
    header: 'Image identification',
    message: (
      <T>
        Image classifier is currently <b>disabled</b>. Please go to app{' '}
        <b>Settings</b> to turn it on.
      </T>
    ),
    buttons: [
      {
        text: 'OK, got it',
        role: 'cancel',
        cssClass: 'primary',
      },
    ],
  });

type Props = {
  match: any;
  sample: typeof Sample;
  photoSelect: any;
  increaseCount: any;
  deleteSpecies: any;
  isDisabled: boolean;
  useImageIdentifier: boolean;
  onIdentifyOccurrence: any;
  onIdentifyAllOccurrences: any;
};

function byCreateTime(occ1: typeof Occurrence, occ2: typeof Occurrence) {
  const date1 = new Date(occ1.metadata.created_on);
  const date2 = new Date(occ2.metadata.created_on);
  return date2.getTime() - date1.getTime();
}

const HomeMain: FC<Props> = ({
  match,
  sample,
  increaseCount,
  deleteSpecies,
  isDisabled,
  photoSelect,
  useImageIdentifier,
  onIdentifyOccurrence,
  onIdentifyAllOccurrences,
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

  const getSpeciesEntry = (occ: typeof Occurrence) => {
    const speciesName = occ.getTaxonName();
    const speciesCount = occ.attrs.count;

    const increaseCountWrap = (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      increaseCount(occ);
    };

    const deleteSpeciesWrap = () => deleteSpecies(occ);

    const navigateToSpeciesOccurrences = () =>
      navigate(`${match.url}/occ/${occ.cid}`);

    return (
      <IonItemSliding key={occ.cid}>
        <IonItem onClick={navigateToSpeciesOccurrences} detail={!isDisabled}>
          <IonButton
            className="moth-trap-count-button"
            onClick={increaseCountWrap}
            fill="clear"
          >
            <AnimatedNumber value={speciesCount} />

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

  const getNewImageButton = () => {
    return (
      <div className="buttons-wrapper">
        {!useImageIdentifier && (
          <div onClick={shownDisabledImageIdentifierAlert}>
            <IonIcon className="alert-icon" icon={warningOutline} />
          </div>
        )}
        <IonButton
          className={clsx(`camera-button`, !useImageIdentifier && 'disabled')}
          type="submit"
          expand="block"
          onClick={photoSelect}
        >
          <IonIcon slot="start" icon={camera} size="large" />
        </IonButton>
      </div>
    );
  };

  const isUnidentifiedSpeciesLengthMoreThanFive = () => {
    const unIdentifiedSpecies = (occ: typeof Occurrence) =>
      occ.media[0] &&
      !occ.media[0]?.attrs?.species &&
      occ.attrs?.taxon.warehouse_id ===
        UNKNOWN_SPECIES.preferred_taxa_taxon_list_id;

    return sample.occurrences.filter(unIdentifiedSpecies).length >= 5;
  };

  const getUndentifiedspeciesList = () => {
    const byUnknownSpecies = (occ: typeof Occurrence) =>
      !occ.attrs.taxon ||
      occ.attrs?.taxon.warehouse_id ===
        UNKNOWN_SPECIES.preferred_taxa_taxon_list_id;

    const getUnidentifiedSpeciesEntry = (occ: typeof Occurrence) => (
      <UnidentifiedSpeciesEntry
        key={occ.cid}
        occ={occ}
        isDisabled={isDisabled}
        onIdentify={onIdentifyOccurrence}
        isUnidentifiedSpeciesLengthMoreThanFive={isUnidentifiedSpeciesLengthMoreThanFive()}
      />
    );
    const speciesList = sample.occurrences
      .filter(byUnknownSpecies)
      .sort(byCreateTime)
      .map(getUnidentifiedSpeciesEntry);

    const count = speciesList.length > 1 ? speciesList.length : null;

    if (speciesList.length < 1) return null;

    return (
      <>
        <IonList id="list" lines="full">
          <div className="rounded">
            <IonItemDivider className="species-list-header unknown">
              <IonLabel
                className={clsx(
                  !isUnidentifiedSpeciesLengthMoreThanFive() && 'full-width'
                )}
              >
                <T>Unknown species</T>
              </IonLabel>
              {!isUnidentifiedSpeciesLengthMoreThanFive() && (
                <IonLabel className="count">{count}</IonLabel>
              )}

              {isUnidentifiedSpeciesLengthMoreThanFive() && (
                <IonButton size="small" onClick={onIdentifyAllOccurrences}>
                  <T>Identify All</T>
                </IonButton>
              )}
            </IonItemDivider>

            {speciesList}
          </div>
        </IonList>
      </>
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

    const byKnownSpecies = (occ: typeof Occurrence) =>
      occ.attrs.taxon &&
      occ.attrs.taxon.warehouse_id !==
        UNKNOWN_SPECIES.preferred_taxa_taxon_list_id;

    const speciesList = sample.occurrences
      .filter(byKnownSpecies)
      .map(getSpeciesEntry);

    const count = speciesList.length > 1 ? speciesList.length : null;

    if (!speciesList.length) return null;

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

        {!isDisabled && (
          <div className="buttons-container">
            {getSpeciesAddButton()}

            {getNewImageButton()}
          </div>
        )}

        {getUndentifiedspeciesList()}

        {getSpeciesList()}
      </IonList>
    </Main>
  );
};

export default observer(HomeMain);
