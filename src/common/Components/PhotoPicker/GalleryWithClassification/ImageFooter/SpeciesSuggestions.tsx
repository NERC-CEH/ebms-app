import { useEffect } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { IonSpinner, useIonModal } from '@ionic/react';
import ProbabilityBadge from 'common/Components/ProbabilityBadge';
import { Button } from 'common/flumens';
import Media from 'common/models/media';
import Occurrence, { ClassifierSuggestion } from 'common/models/occurrence';
import ClassificationStatus from '../../ClassificationStatus';

const SNAP_POSITIONS = [0, 0.4, 0.6, 1];
const DEFAULT_SNAP_POSITION = 0.4;

type Props = {
  occurrence: Occurrence;
  media: Media;
  identifySpecies?: (manualTrigger?: boolean) => void;
  onSpeciesSelect: (suggestion: ClassifierSuggestion) => void;
};

const SpeciesSuggestions = ({
  occurrence,
  media,
  identifySpecies,
  onSpeciesSelect,
}: Props) => {
  const identifierWasNotUsed = !media?.data.species;
  const speciesList = media?.data.species;

  const getSuggestions = () => {
    const identifierFoundNoSpecies = !speciesList?.length;
    if (identifierFoundNoSpecies)
      return (
        <div className="mt-5 p-8">
          <T>common.identificationFailed</T>
          <div>
            <T>common.identificationPhotoTip</T>
          </div>
        </div>
      );

    const getSuggestionItem = (suggestion: ClassifierSuggestion) => {
      const { commonName, scientificName, probability } = suggestion;

      return (
        <div className="flex min-h-20 w-full items-center justify-start gap-3 border-b border-neutral-100 border-solid p-2">
          <ProbabilityBadge
            probability={probability}
            className="shrink-0"
            showInfo
          />
          <div className="flex w-full flex-col gap-1">
            {!!commonName && <b>{commonName}</b>}
            {!!scientificName && <i>{scientificName}</i>}
          </div>

          <Button
            className="shrink-0 px-3 py-2 text-sm"
            onPress={() => {
              // eslint-disable-next-line @typescript-eslint/no-use-before-define
              dismissSuggestions();
              onSpeciesSelect(suggestion);
            }}
            fill="outline"
          >
            common.select
          </Button>
        </div>
      );
    };

    const suggestions = speciesList.map(getSuggestionItem);

    return (
      <div className="mx-2 mt-5">
        <h2 className="mx-2 text-xl font-bold!">
          <T>common.suggestions</T>:
        </h2>
        <div className="mx-2 my-1 opacity-80 text-sm">
          <div>
            <T>common.noteAiConfidence</T>
          </div>
          <div className="mt-1">
            <T>common.addIdentificationEvidence</T>
          </div>
        </div>
        <div className="flex flex-col">{suggestions}</div>
      </div>
    );
  };

  const [presentSuggestions, dismissSuggestions] = useIonModal(getSuggestions);
  useEffect(() => dismissSuggestions, []);

  if (media.isIdentifying) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-md border border-white bg-black/70 p-3 text-white">
        <T>common.identifying</T>{' '}
        <IonSpinner color="light" className="size-5" />
      </div>
    );
  }

  if (identifierWasNotUsed && !occurrence.isDisabled) {
    return (
      <Button
        className="shrink-0 bg-black/70 text-white"
        onPress={() => identifySpecies?.(true)}
        fill="outline"
      >
        common.getSpeciesSuggestions
      </Button>
    );
  }

  const onOpen = () =>
    presentSuggestions({
      backdropDismiss: false,
      backdropBreakpoint: 0.5,
      breakpoints: SNAP_POSITIONS,
      initialBreakpoint: DEFAULT_SNAP_POSITION,
      canDismiss: true,
      cssClass: '[&::part(handle)]:mt-2',
    });

  return (
    <Button
      className="shrink-0 bg-black/70 pl-3 text-white"
      onPress={onOpen}
      fill="outline"
      prefix={<ClassificationStatus media={media} />}
    >
      common.suggestions
    </Button>
  );
};

export default observer(SpeciesSuggestions);
