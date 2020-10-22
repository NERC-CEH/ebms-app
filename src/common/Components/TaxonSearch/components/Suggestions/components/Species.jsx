import React from 'react';
import PropTypes from 'prop-types';
import { IonItem } from '@ionic/react';
import Log from 'helpers/log';
import './styles.scss';

const onClick = (e, species, onSelect) => {
  Log('taxon: selected.', 'd');
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

  return (
    <IonItem
      className={`search-result ${isRecorded ? 'recorded' : ''}`}
      onClick={e => !isRecorded && onClick(e, species, onSelect)}
    >
      <div className="taxon">{prettyName}</div>
    </IonItem>
  );
};

Species.propTypes = {
  species: PropTypes.object.isRequired,
  searchPhrase: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default Species;
