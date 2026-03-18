import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { Checkbox, CheckboxOption } from '@flumens';
import groups from 'common/data/groups';
import appModel from 'models/app';

const SpeciesGroupsSlide = () => {
  const onChange = (newValues: string[]) => {
    appModel.data.speciesGroups = newValues.map(id => Number.parseInt(id, 10));
    appModel.save();
  };

  const options: CheckboxOption[] = Object.values(groups).map(
    ({ id, prefix, label }) => ({ value: `${id}`, prefix, label })
  );

  const value = appModel.data.speciesGroups.map(String);

  return (
    <div className="flex h-full flex-col items-center justify-between gap-4 px-4">
      <div className="text-2xl mt-20">
        <T>
          Which <b>species groups</b> are you interested in?
        </T>
      </div>

      <div className="absolute inset-0 top-[30vh] flex flex-col items-center justify-center bg-[linear-gradient(to_right,#e8e8e8,transparent_1px),linear-gradient(to_bottom,#e8e8e8,transparent_1px)] bg-[size:24px_24px] bg-[position:-1px_-1px]">
        <Checkbox
          className="w-full px-3"
          onChange={onChange}
          options={options}
          value={value}
        />
      </div>
    </div>
  );
};

export default observer(SpeciesGroupsSlide);
