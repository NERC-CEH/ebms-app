import type { MouseEvent, ReactNode } from 'react';
import { Trans as T } from 'react-i18next';
import { IonItem } from '@ionic/react';
import groups from 'common/data/groups';
import { getTaxonName, type SuggestionResult } from '../types';
import './styles.scss';

type GroupLabels = Record<number, string>;

const reduceToIdAndLabel = (
  agg: GroupLabels,
  { label, id }: { label: string; id?: number }
): GroupLabels => (typeof id !== 'number' ? agg : { ...agg, [id]: label });

const groupLabels = Object.values(groups).reduce<GroupLabels>(
  reduceToIdAndLabel,
  {} as GroupLabels
);

type OnSelectSpecies = (species: SuggestionResult, edit?: boolean) => void;

const onClick = (
  e: MouseEvent<HTMLElement>,
  species: SuggestionResult,
  onSelect: OnSelectSpecies
) => {
  const target = e.target as HTMLElement | null;
  const edit = target?.tagName === 'BUTTON';
  onSelect(species, edit);
};

/**
 * Highlight the searched parts of taxa names.
 * @param name
 * @param searchPhrase
 * @returns {*}
 * @private
 */
function prettifyName(
  species: SuggestionResult,
  searchPhrase: string
): ReactNode {
  const name = getTaxonName(species);
  const normalizedName = name ?? '';
  const normalizedSearch = searchPhrase.toLowerCase();

  if (!normalizedSearch) {
    return normalizedName;
  }

  const searchPos = normalizedName.toLowerCase().indexOf(normalizedSearch);
  if (!(searchPos >= 0)) {
    return normalizedName;
  }
  return (
    <>
      {normalizedName.slice(0, searchPos)}
      <b>
        {normalizedName.slice(searchPos, searchPos + normalizedSearch.length)}
      </b>
      {normalizedName.slice(searchPos + normalizedSearch.length)}
    </>
  );
}

type SpeciesProps = {
  species: SuggestionResult;
  searchPhrase: string;
  onSelect: OnSelectSpecies;
};

const Species = ({ species, searchPhrase, onSelect }: SpeciesProps) => {
  const prettyName = prettifyName(species, searchPhrase);
  const { isRecorded } = species;
  const speciesGroup = groupLabels[species.group] ?? '';

  const onSelectSpecies = (e: MouseEvent<HTMLElement>) =>
    onClick(e, species, onSelect);

  return (
    <IonItem
      className={`search-result ${isRecorded ? 'recorded' : ''}`}
      onClick={onSelectSpecies}
    >
      <div className="taxon">{prettyName}</div>
      <div className="group">
        <T>{speciesGroup}</T>
      </div>
    </IonItem>
  );
};

export default Species;
