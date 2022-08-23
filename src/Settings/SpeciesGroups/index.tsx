import { FC } from 'react';
import { AppModel } from 'models/app';
import { observer } from 'mobx-react';
import { AttrPage } from '@flumens';
import groups from 'common/data/species/groups.json';
import mothIcon from 'common/images/moth.svg';
import './styles.scss';

type Props = {
  appModel: AppModel;
};

const SpeciesGroups: FC<Props> = ({ appModel }) => {
  return (
    <AttrPage
      attr="speciesGroups"
      className="species-groups"
      model={appModel}
      attrProps={{
        input: 'checkbox',
        info: 'Please select the species groups that you always record.',
        set(newValues, model) {
          const hasMothGroup = newValues.includes('moths');
          const hasDayFlyingMothGroup = newValues.includes('day-flying-moths');
          if (hasMothGroup && hasDayFlyingMothGroup) {
            // eslint-disable-next-line no-param-reassign
            model.attrs.useDayFlyingMothsOnly = true;
          }

          if (!hasMothGroup || !hasDayFlyingMothGroup) {
            // eslint-disable-next-line no-param-reassign
            model.attrs.useDayFlyingMothsOnly = false;
          }

          // eslint-disable-next-line no-param-reassign
          model.attrs.speciesGroups = newValues;
          model.save();
        },
        inputProps: (model: AppModel) => {
          const nonDayFlyingMoths = (group: any) =>
            group.value !== 'day-flying-moths';

          const groupOption = ([value, { label }]: any) => ({
            value,
            label,
          });
          const options: any = Object.entries(groups)
            .map(groupOption)
            .filter(nonDayFlyingMoths);

          if (model.attrs.speciesGroups?.includes('moths')) {
            options.splice(2, 0, {
              value: 'day-flying-moths',
              label: 'Use only day-flying moths',
              className: 'inline',
              icon: mothIcon,
            });
          }
          return { options };
        },
      }}
      headerProps={{ title: 'Species groups' }}
    />
  );
};

export default observer(SpeciesGroups);
