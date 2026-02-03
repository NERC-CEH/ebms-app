import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router-dom';
import { Page, Header, useAlert, useSample } from '@flumens';
import { NavContext, useIonViewWillEnter } from '@ionic/react';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import Main from './Main';
import './styles.scss';

export const useDeleteConfirmation = () => {
  const alert = useAlert();

  const prompt = (resolve: any) => {
    alert({
      header: 'Delete',
      message: 'Are you sure you want to delete this occurrence?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => resolve(false),
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => resolve(true),
        },
      ],
    });
  };

  const promptWrap = () => new Promise(prompt);

  return promptWrap;
};

function byCreationDate(s1: Sample, s2: Sample) {
  const date1 = new Date(s1.updatedAt);
  const date2 = new Date(s2.updatedAt);

  return date2.getTime() - date1.getTime();
}

const SpeciesOccurrences = () => {
  const { navigate, goBack } = useContext(NavContext);
  const match = useRouteMatch<any>();

  const confirmDelete = useDeleteConfirmation();

  const { sample } = useSample<Sample>();
  if (!sample) throw new Error('Sample is missing');

  const { taxa } = match.params;

  const navigateToOccurrence = (smp: Sample) => {
    const url = match.url.split('/speciesOccurrences');
    url.pop(); // go back to edit
    const occ = smp.occurrences[0];

    navigate(`${url}/samples/${smp.cid}/occ/${occ.cid}`);
  };

  const getSamples = () => {
    const matchesTaxa = ({ occurrences }: Sample) => {
      const [occ] = occurrences;
      if (!occ) return false;

      const { warehouseId, preferredId } = occ.data.taxon;
      if (preferredId === parseInt(taxa, 10)) return true;

      if (warehouseId === parseInt(taxa, 10)) return true;

      return false;
    };

    const samples = sample.samples.filter(matchesTaxa).sort(byCreationDate);

    return samples;
  };

  const deleteSample = async (smp: Sample) => {
    const shouldDelete = await confirmDelete();
    if (!shouldDelete) return;

    const taxon = { ...smp.occurrences[0].data.taxon };
    await smp.destroy();

    const byTaxonId = (s: Sample) =>
      s.occurrences[0].data.taxon.id === taxon.id;

    const isLastSampleDeleted = !sample.samples.filter(byTaxonId).length;
    if (isLastSampleDeleted && !sample.isPreciseSingleSpeciesSurvey()) {
      goBack();
      return;
    }

    if (isLastSampleDeleted) {
      const survey = sample.getSurvey();

      const newSubSample = survey.smp!.create!({
        Sample,
        Occurrence,
        taxon,
        zeroAbundance: 't',
      });
      sample.samples.push(newSubSample);
      sample.save();

      goBack();
    }
  };

  useIonViewWillEnter(() => {
    const samples = getSamples();
    if (!samples.length) {
      goBack();
    }
  });

  const { isDisabled } = sample;

  return (
    <Page id="precise-area-count-edit-taxon-group">
      <Header title="Occurrences" />
      <Main
        samples={getSamples()}
        isDisabled={isDisabled}
        deleteSample={deleteSample}
        navigateToOccurrence={navigateToOccurrence}
      />
    </Page>
  );
};

export default observer(SpeciesOccurrences);
