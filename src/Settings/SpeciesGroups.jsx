import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import { AttrPage } from '@flumens';
import groups from 'common/data/species/groups.json';

const groupOption = ([value, { label }]) => ({
  value,
  label,
});
const groupOptions = Object.entries(groups).map(groupOption);

function SpeciesGroups({ appModel }) {
  return (
    <AttrPage
      attr="speciesGroups"
      model={appModel}
      attrProps={{
        input: 'checkbox',
        info: 'Please select the species groups that you always record.',
        inputProps: { options: groupOptions },
        set: (value, model) => {
          // eslint-disable-next-line no-param-reassign
          model.attrs.speciesGroups = value;
          if (!value?.includes('moths')) {
            // eslint-disable-next-line no-param-reassign
            model.attrs.useDayFlyingMothsOnly = false;
          }
        },
      }}
      headerProps={{ title: 'Species groups' }}
    />
  );
}

SpeciesGroups.propTypes = exact({
  appModel: PropTypes.object.isRequired,
});

export default SpeciesGroups;
