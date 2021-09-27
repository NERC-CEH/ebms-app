import React from 'react';
import PropTypes from 'prop-types';
import { IonItem } from '@ionic/react';
import groups from 'common/data/species/groups.json';
import { Trans as T } from 'react-i18next';
import './styles.scss';

const reduceToIdAndLabel = (agg, { label, id }) => ({ ...agg, [id]: label });
const groupLabels = Object.values(groups).reduce(reduceToIdAndLabel, {});

const onClick = (e, species, onSelect) => {
  const edit = e.target.tagName === 'BUTTON';
  onSelect(species, edit);
};

/**
 * Highlight the searched parts of taxa names.
 * @param name
 * @param searchPhrase
 * @returns {*}
 * @private
 */
function prettifyName(species, searchPhrase) {
  const foundInName = species.found_in_name;

  const name = species[foundInName];

  const searchPos = name.toLowerCase().indexOf(searchPhrase);
  if (!(searchPos >= 0)) {
    return name;
  }
  return (
    <>
      {name.slice(0, searchPos)}
      <b>{name.slice(searchPos, searchPos + searchPhrase.length)}</b>
      {name.slice(searchPos + searchPhrase.length)}
    </>
  );
}

const Species = ({ species, searchPhrase, onSelect }) => {
  const prettyName = prettifyName(species, searchPhrase);
  const { isRecorded } = species;
  const speciesGroup = groupLabels[species.group];

  const onSelectSpecies = e => onClick(e, species, onSelect);
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

Species.propTypes = {
  species: PropTypes.object.isRequired,
  searchPhrase: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default Species;
