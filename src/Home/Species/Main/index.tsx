import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { informationCircleOutline } from 'ionicons/icons';
import { Main, ModalHeader, InfoMessage, UserFeedbackRequest } from '@flumens';
import { IonModal, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/react';
import config from 'common/config';
import speciesProfiles, { Species as SpeciesType } from 'common/data/profiles';
import appModel from 'models/app';
import samplesCollection from 'models/collections/samples';
import userModel from 'models/user';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import SpeciesProfile from './SpeciesProfile';
import './images';
import './styles.scss';
import './thumbnails';

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
function escapeRegexCharacters(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

type Props = {
  filters: string[];
  searchPhrase?: string;
};

const MainComponent: FC<Props> = ({ searchPhrase = '', filters }) => {
  const [species, setSpecies] = useState<any>(null);

  const showSpeciesModal = (id: number) => {
    const bySpeciesId = (sp: SpeciesType) => sp.id === id;
    setSpecies(speciesProfiles.find(bySpeciesId));
  };

  const hideSpeciesModal = () => setSpecies(null);

  const getSpecies = (country: string) => {
    const existInCountry = (sp: SpeciesType) => {
      if (country === 'ELSEWHERE') {
        return true;
      }

      const abundanceStatus = (sp.abundance as any)[country];
      if (!abundanceStatus) {
        return false;
      }

      const isPresent = !['A', 'Ex'].includes(abundanceStatus);
      return isPresent;
    };
    const byNotEmptyContent = (sp: SpeciesType) => {
      const hasDescription = (window as any).t(sp.descriptionKey, true);
      const hasImage = sp?.image_copyright?.length;

      return hasImage && hasDescription;
    };
    const bySpeciesId = (sp1: SpeciesType, sp2: SpeciesType) =>
      sp1.sort_id! - sp2.sort_id!;

    let filteredSpecies = [...speciesProfiles].filter(existInCountry);
    const totalSpeciesCountryCount = filteredSpecies.length;

    filteredSpecies = filteredSpecies
      .filter(byNotEmptyContent)
      .sort(bySpeciesId);

    const currentSpeciesCountryCount = filteredSpecies.length;

    const filterBySearchPhrase = (sp: SpeciesType) => {
      const re = new RegExp(escapeRegexCharacters(searchPhrase), 'i');

      const commonName = (window as any).t(sp.taxon, null, true);
      const matchesCommonName = re.test(commonName);
      const matchesLatinName = re.test(sp.taxon);

      return matchesCommonName || matchesLatinName;
    };

    if (searchPhrase) {
      filteredSpecies = filteredSpecies.filter(filterBySearchPhrase);
    }

    if (filters?.length) {
      const byFamily = (sp: SpeciesType) => filters.includes(sp.family!);
      filteredSpecies = filteredSpecies.filter(byFamily);
    }

    return [
      filteredSpecies,
      currentSpeciesCountryCount,
      totalSpeciesCountryCount,
    ];
  };

  const getSpeciesGrid = (speciesList: SpeciesType[]) => {
    if (!speciesList.length)
      return (
        <InfoBackgroundMessage>
          Sorry, no species were found.
        </InfoBackgroundMessage>
      );

    const { showCommonNamesInGuide } = appModel.attrs;

    const getSpeciesElement = (sp: SpeciesType) => {
      const { id, taxon } = sp;

      let label = taxon;
      if (showCommonNamesInGuide) {
        label = (window as any).t(taxon, null, true) || label; // might not have translation
      }

      const onClick = () => showSpeciesModal(id!);

      return (
        <IonCol
          key={id}
          className="species-list-item ion-no-padding ion-no-margin"
          onClick={onClick}
          size="6"
          size-lg
        >
          <div
            style={{
              backgroundImage: `url('/images/${id}_thumbnail.jpg')`,
            }}
          >
            <span className="label">{label}</span>
          </div>
        </IonCol>
      );
    };

    const speciesColumns = speciesList.map(getSpeciesElement);

    return (
      <IonGrid className="ion-no-padding ion-no-margin">
        <IonRow className="ion-no-padding ion-no-margin">
          {speciesColumns}
        </IonRow>
      </IonGrid>
    );
  };

  const onFeedbackDone = () => {
    appModel.attrs.feedbackGiven = true;
    appModel.save();
  };

  const showFeedback = () => {
    if (appModel.attrs.feedbackGiven) {
      return false;
    }

    if (appModel.attrs.useTraining) {
      return false;
    }

    if (!userModel.isLoggedIn()) {
      return false;
    }

    return samplesCollection.length > 5;
  };

  let country: any = appModel.attrs.country!;
  country = country === 'UK' ? 'GB' : country;

  const [speciesList, countrySpeciesCount, totalSpeciesCountryCount] =
    getSpecies(country) as [SpeciesType[], number, number];

  const feedbackPanel = showFeedback() && (
    <UserFeedbackRequest
      email={config.feedbackEmail}
      onFeedbackDone={onFeedbackDone}
    />
  );

  const isNotFiltered = !searchPhrase && !filters?.length;

  return (
    <Main className="guide ion-padding">
      {feedbackPanel}

      {getSpeciesGrid(speciesList)}

      {isNotFiltered && (
        <InfoMessage
          prefix={<IonIcon src={informationCircleOutline} className="size-6" />}
          color="tertiary"
          inline
        >
          This guide is still in development. It covers{' '}
          {{ countrySpeciesCount } as any} butterfly species out of the{' '}
          {{ totalSpeciesCountryCount } as any} species in your selected
          country.
        </InfoMessage>
      )}

      <IonModal isOpen={!!species} backdropDismiss={false}>
        <ModalHeader title="Species" onClose={hideSpeciesModal} />
        {species && (
          <SpeciesProfile
            species={species}
            country={country}
            hideSpeciesModal={hideSpeciesModal}
          />
        )}
      </IonModal>
    </Main>
  );
};

export default observer(MainComponent);
