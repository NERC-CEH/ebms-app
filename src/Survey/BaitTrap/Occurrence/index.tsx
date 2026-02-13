import { observer } from 'mobx-react';
import { Page, Header, useSample } from '@flumens';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import { Data, fieldCodeAttr, OccData } from '../config';
import Main from './Main';

const getSpeciesCode = (sample: Sample<Data>, occurrence: Occurrence) => {
  const fieldCode = sample.data[fieldCodeAttr.id] || '';

  // collect all occurrences across all sub-samples, flattened
  const allOccurrences = sample.samples.flatMap(smp => smp.occurrences);

  // find this occurrence's index (1-based)
  const index = allOccurrences.findIndex(occ => occ.cid === occurrence.cid) + 1;

  return `${fieldCode}${index}`;
};

const OccurrenceController = () => {
  const { sample, occurrence } = useSample<Sample<Data>, Occurrence<OccData>>();
  if (!sample || !occurrence) return null;

  const speciesCode = getSpeciesCode(sample, occurrence);

  return (
    <Page id="survey-bait-trap-edit-occurrence">
      <Header
        title="Edit Occurrence"
        rightSlot={
          <div className="pr-3 flex flex-col items-center">
            <div className="text-xs">Code:</div>
            <div className="font-extrabold -m-0.5">{speciesCode}</div>
          </div>
        }
      />
      <Main occurrence={occurrence} />
    </Page>
  );
};

export default observer(OccurrenceController);
