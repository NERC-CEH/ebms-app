import { FC } from 'react';
import { AppModel } from 'models/app';
import { observer } from 'mobx-react';
import { AttrPage } from '@flumens';
import groups from 'common/data/species/groups.json';
import './styles.scss';

type Props = {
  appModel: AppModel;
};

const DAY_FLYING_MOTHS = 'day-flying-moths';
const MOTHS = 'moths';

const set = (newValues: string[], model: AppModel) => {
  const hasMothGroup = newValues.includes(MOTHS);
  const hasDayFlyingMothGroup = newValues.includes(DAY_FLYING_MOTHS);

  // eslint-disable-next-line no-param-reassign
  newValues = newValues.filter((group: string) => group !== DAY_FLYING_MOTHS);

  // eslint-disable-next-line no-param-reassign
  model.attrs.useDayFlyingMothsOnly = hasMothGroup && hasDayFlyingMothGroup;

  // eslint-disable-next-line no-param-reassign
  model.attrs.speciesGroups = newValues;
};

const get = (model: AppModel) => {
  const speciesGroups = [...model.attrs.speciesGroups];
  if (model.attrs.useDayFlyingMothsOnly) {
    speciesGroups.push(DAY_FLYING_MOTHS);
  }

  return speciesGroups;
};

const inputProps = (model: AppModel) => {
  const groupOption = ([value, { label }]: any) => ({
    value,
    label,
  });
  const options: any = Object.entries(groups).map(groupOption);

  if (model.attrs.speciesGroups?.includes('moths')) {
    options.splice(2, 0, {
      value: DAY_FLYING_MOTHS,
      label: 'Use only day-flying moths',
      className: 'inline',
    });
  }
  return { options };
};

const attrProps = {
  input: 'checkbox',
  info: 'Please select the species groups that you always record.',
  set,
  get,
  inputProps,
};

const SpeciesGroups: FC<Props> = ({ appModel }) => {
  return (
    <AttrPage
      attr="speciesGroups"
      className="species-groups"
      model={appModel}
      attrProps={attrProps}
      headerProps={{ title: 'Species groups' }}
    />
  );
};

export default observer(SpeciesGroups);
