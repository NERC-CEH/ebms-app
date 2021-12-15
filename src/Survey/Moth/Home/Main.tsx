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
import { UNKNOWN_OCCURRENCE } from 'Survey/Moth/config';
import UnidentifiedSpeciesEntry from '../Components/UnidentifiendSpeciesEntry';
import AnimatedNumber from './Components/AnimatedNumber';
import './styles.scss';

const showDurationOfRecordsAlert = () =>
  alert({
    message: (
      <T>
        Auto image identifier is disabled. Please visit app settings page to
        turn it on.
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
};

const HomeMain: FC<Props> = ({
  match,
  sample,
  increaseCount,
  deleteSpecies,
  isDisabled,
  photoSelect,
  useImageIdentifier,
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
    const speciesName = occ.attrs.taxon.scientific_name;
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
        <IonItem onClick={navigateToSpeciesOccurrences} detail={!isDisabled}>
          <IonButton
            className="precise-area-count-edit-count"
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
          <div onClick={showDurationOfRecordsAlert}>
            <IonIcon
              className="info-icon"
              slot="icon-only"
              icon={warningOutline}
            />
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

  const getUndentifiedspeciesList = () => {
    const byUnknownSpecies = (occ: typeof Occurrence) =>
      !occ.attrs.taxon ||
      occ.attrs.taxon.warehouse_id === UNKNOWN_OCCURRENCE.warehouse_id;

    const getUnidentifiedSpeciesEntry = (occ: typeof Occurrence) => (
      <UnidentifiedSpeciesEntry
        key={occ.cid}
        occ={occ}
        isDisabled={isDisabled}
      />
    );
    const speciesList = sample.occurrences
      .filter(byUnknownSpecies)
      .map(getUnidentifiedSpeciesEntry);

    const count = speciesList.length > 1 ? speciesList.length : null;

    if (speciesList.length < 1) return null;

    return (
      <>
        <IonList id="list" lines="full">
          <div className="rounded">
            <IonItemDivider className="species-list-header unknown">
              <IonLabel>
                <T>Unknown species</T>
              </IonLabel>
              <IonLabel>{count}</IonLabel>
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
      occ.attrs.taxon.warehouse_id !== UNKNOWN_OCCURRENCE.warehouse_id;

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
