import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { Page } from '@flumens';
import speciesProfiles, { Species as SpeciesType } from 'common/data/profiles';
import Header from './Header';
import Main from './Main';

const getFamily = (sp: SpeciesType) => sp.family;
const families = speciesProfiles.map(getFamily);
const filterOptions = [{ type: 'family', values: [...new Set(families)] }];

const Species: FC = () => {
  const [searchPhrase, setSearchPhrase] = useState('');

  // in-memory filters
  const [filters, setFilters] = useState<any>({ family: [] });

  const toggleFilter = (type: string, value: string) => {
    if (!filters[type]) {
      filters[type] = [];
    }

    const foundIndex = filters[type]?.indexOf(value) as number;
    if (foundIndex >= 0) {
      filters[type]?.splice(foundIndex, 1);
    } else {
      filters[type]?.unshift(value);
    }
    setFilters({ ...filters });
  };

  return (
    <Page id="home-species">
      <Header
        onSearch={setSearchPhrase}
        toggleFilter={toggleFilter}
        filters={filters}
        filterOptions={filterOptions}
      />
      <Main searchPhrase={searchPhrase} filters={filters.family} />
    </Page>
  );
};

export default observer(Species);
