import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import { AttrPage } from '@apps';
import groups from 'common/data/species/groups.json';

const groupOptions = Object.entries(groups).map(([value, { label }]) => ({
  value,
  label,
}));

function SpeciesGroups({ appModel }) {
  return (
    <AttrPage
      attr="speciesGroups"
      model={appModel}
      attrProps={{
        input: 'checkbox',
        info: 'Please select the species groups that you always record.',
        inputProps: { options: groupOptions },
      }}
      headerProps={{ title: 'Species groups' }}
    />
  );
}

SpeciesGroups.propTypes = exact({
  appModel: PropTypes.object.isRequired,
});

export default SpeciesGroups;
