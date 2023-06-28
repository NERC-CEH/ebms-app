import { FC, useContext } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Page, Header, useAlert } from '@flumens';
import { NavContext, useIonViewWillEnter } from '@ionic/react';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
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
  const date1 = new Date(s1.metadata.updatedOn);
  const date2 = new Date(s2.metadata.updatedOn);

  return date2.getTime() - date1.getTime();
}

type Props = {
  sample: Sample;
};

const SpeciesOccurrences: FC<Props> = ({ sample }) => {
  const { navigate, goBack } = useContext(NavContext);
  const match = useRouteMatch<any>();

  const confirmDelete = useDeleteConfirmation();

  const { taxa } = match.params;

  const navigateToOccurrence = (smp: Sample) => {
    const url = match.url.split('/speciesOccurrences');
    url.pop(); // go back to edit
    const occ = smp.occurrences[0];

    navigate(`${url}/samples/${smp.cid}/occ/${occ.cid}`);
  };

  const getSamples = () => {
    const matchesTaxa = ({ occurrences }: any) => {
      const [occ] = occurrences; // always one
      return occ.attrs.taxon.warehouse_id === parseInt(taxa, 10);
    };

    const samples = sample.samples.filter(matchesTaxa).sort(byCreationDate);

    return samples;
  };

  const deleteSample = async (smp: Sample) => {
    const shouldDelete = await confirmDelete();
    if (!shouldDelete) return;

    const taxon = { ...smp.occurrences[0].attrs.taxon };
    await smp.destroy();

    const byTaxonId = (s: Sample) =>
      s.occurrences[0].attrs.taxon.id === taxon.id;

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

  const isDisabled = sample.isDisabled();

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
