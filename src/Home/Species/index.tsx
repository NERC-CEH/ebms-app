import { FC, useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { bookOutline, helpBuoyOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Page, useAlert } from '@flumens';
import { IonIcon } from '@ionic/react';
import speciesProfiles, { Species as SpeciesType } from 'common/data/profiles';
import { AppModel } from 'models/app';
import Header from './Header';
import Main from './Main';

const getFamily = (sp: SpeciesType) => sp.family;

const existFamily = (sp: SpeciesType['family']) => sp;
const families = speciesProfiles.map(getFamily).filter(existFamily);

const uniqueFamilyList = Array.from(new Set(families));

const filterOptions = [{ type: 'family', values: uniqueFamilyList }];

type Props = {
  appModel: AppModel;
};

const Species: FC<Props> = ({ appModel }) => {
  const [searchPhrase, setSearchPhrase] = useState('');
  const alert = useAlert();

  const showInfoGuideTip = () => {
    if (!appModel.attrs.showGuideHelpTip) {
      return;
    }

    alert({
      header: 'Tip: Finding Help',
      message: (
        <T>
          Please visit the Guide{' '}
          <IonIcon icon={bookOutline} style={{ marginBottom: '-3px' }} /> and
          Help{' '}
          <IonIcon icon={helpBuoyOutline} style={{ marginBottom: '-3px' }} />{' '}
          pages before using the app!
        </T>
      ),
      buttons: [
        {
          text: 'OK, got it',
          role: 'cancel',
          cssClass: 'primary',
        },
      ],
    });
    // eslint-disable-next-line no-param-reassign
    appModel.attrs.showGuideHelpTip = false;
    appModel.save();
  };

  useEffect(() => {
    showInfoGuideTip();
  }, []);

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
      <Main searchPhrase={searchPhrase} filters={[...filters.family]} />
    </Page>
  );
};

export default observer(Species);
