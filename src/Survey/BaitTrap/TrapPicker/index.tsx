import { useContext } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { Page, useSample, LocationType } from '@flumens';
import { NavContext } from '@ionic/react';
import locations, { byType } from 'models/collections/locations';
import Location from 'models/location';
import Sample from 'models/sample';
import config, { Data } from '../config';
import Header from './Header';
import Main from './Main';

const TrapPickerController = () => {
  const { navigate } = useContext(NavContext);

  const { sample } = useSample<Sample<Data>>();
  if (!sample) throw new Error('Sample is missing');

  const onTrapSelect = (trap: Location) => {
    // create a new trap visit sub-sample with the selected trap's location
    const trapVisit = config.smp.create({
      Sample,
      location: toJS(trap.data),
    });

    sample.samples.push(trapVisit);
    sample.save();

    // navigate to trap details page, replacing trap picker in history
    const baseURL = `/survey/bait-trap/${sample.cid}`;
    navigate(`${baseURL}/traps/${trapVisit.cid}/details`, 'forward', 'replace');
  };

  const siteId = (sample.data.location as any)?.id; // eslint-disable-line

  // filter traps by parent site ID
  const byParentId = (loc: Location) => loc.data.parentId === siteId;

  const traps = locations
    .filter(byType(LocationType.BaitTrap))
    .filter(byParentId);

  return (
    <Page id="bait-trap-trap-picker">
      <Header />
      <Main traps={traps} onTrapSelect={onTrapSelect} />
    </Page>
  );
};

export default observer(TrapPickerController);
