import { FC, useContext } from 'react';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import config from 'common/config';
import {
  Main,
  MenuAttrItem,
  InfoBackgroundMessage,
  useAlert,
  InfoMessage,
} from '@flumens';
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
import { getUnkownSpecies } from 'Survey/Moth/config';
import {
  informationCircle,
  locationOutline,
  camera,
  warningOutline,
} from 'ionicons/icons';
import IncrementalButton from 'Survey/common/IncrementalButton';
import UnidentifiedSpeciesEntry from './Components/UnidentifiedSpeciesEntry';
import './styles.scss';

function useDisabledImageIdentifierAlert() {
  const alert = useAlert();

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

  return shownDisabledImageIdentifierAlert;
}

type Props = {
  match: any;
  sample: Sample;
  photoSelect: any;
  increaseCount: any;
  deleteSpecies: any;
  isDisabled: boolean;
  useImageIdentifier: boolean;
  onIdentifyOccurrence: any;
  onIdentifyAllOccurrences: any;
};

function byCreateTime(occ1: Occurrence, occ2: Occurrence) {
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
  const shownDisabledImageIdentifierAlert = useDisabledImageIdentifierAlert();

  const UNKNOWN_SPECIES_PREFFERD_ID = getUnkownSpecies().warehouse_id;

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

  const getSpeciesEntry = (occ: Occurrence) => {
    const speciesName = occ.getTaxonName();
    const speciesCount = occ.attrs.count;

    const increaseCountWrap = () => increaseCount(occ);
    const increase5xCountWrap = () => increaseCount(occ, true);

    const deleteSpeciesWrap = () => deleteSpecies(occ);

    const navigateToSpeciesOccurrences = () =>
      navigate(`${match.url}/occ/${occ.cid}`);

    return (
      <IonItemSliding key={occ.cid}>
        <IonItem onClick={navigateToSpeciesOccurrences} detail={!isDisabled}>
          <IncrementalButton
            onClick={increaseCountWrap}
            onLongClick={increase5xCountWrap}
            value={speciesCount}
            disabled={isDisabled}
          />
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
    const unIdentifiedSpecies = (occ: Occurrence) =>
      occ.media[0] &&
      !occ.media[0]?.attrs?.species &&
      occ.attrs?.taxon.warehouse_id === UNKNOWN_SPECIES_PREFFERD_ID;

    return sample.occurrences.filter(unIdentifiedSpecies).length >= 5;
  };

  const getUndentifiedspeciesList = () => {
    const byUnknownSpecies = (occ: Occurrence) =>
      !occ.attrs.taxon ||
      occ.attrs?.taxon.warehouse_id === UNKNOWN_SPECIES_PREFFERD_ID;

    const getUnidentifiedSpeciesEntry = (occ: Occurrence) => (
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

    const byKnownSpecies = (occ: Occurrence) =>
      occ.attrs.taxon &&
      occ.attrs.taxon.warehouse_id !== UNKNOWN_SPECIES_PREFFERD_ID;

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
              <IonLabel>
                <T>Count</T>
              </IonLabel>
              <IonLabel>
                <T>Species</T>
              </IonLabel>
              <IonLabel>{count}</IonLabel>
            </IonItemDivider>

            {speciesList}
          </div>
        </IonList>
      </>
    );
  };

  const { webForm } = sample.getSurvey();

  return (
    <Main>
      {isDisabled && (
        <>
          <InfoMessage
            className="blue"
            icon={informationCircle}
            skipTranslation
          >
            <T>
              This record has been submitted and cannot be edited within this
              App.
            </T>
            <IonButton
              href={`${config.backend.url}/${webForm}?sample_id=${sample.id}`}
              expand="block"
              color="dark"
              fill="outline"
              size="small"
              className="website-link"
            >
              <T>eBMS website</T>
            </IonButton>
          </InfoMessage>
        </>
      )}

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
