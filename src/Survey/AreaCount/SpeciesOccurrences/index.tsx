import { FC, useContext } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Page, Header, useAlert } from '@flumens';
import { NavContext, useIonViewWillEnter } from '@ionic/react';
import Sample from 'models/sample';
import Main from './Main';
import './styles.scss';

function deleteSamplePrompt(cb: any, alert: any) {
  alert({
    header: 'Delete',
    message: 'Are you sure you want to delete this occurrence?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: cb,
      },
    ],
  });
}

function byCreationDate(s1: Sample, s2: Sample) {
  const date1 = new Date(s1.metadata.updated_on);
  const date2 = new Date(s2.metadata.updated_on);

  return date2.getTime() - date1.getTime();
}

type Props = {
  sample: Sample;
};

const SpeciesOccurrences: FC<Props> = ({ sample }) => {
  const { navigate, goBack } = useContext(NavContext);
  const match = useRouteMatch<any>();
  const alert = useAlert();

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

  const deleteSample = (smp: Sample) => {
    const destroy = async () => {
      await smp.destroy();
      const samples = getSamples();
      if (!samples.length) {
        goBack();
      }
    };

    deleteSamplePrompt(destroy, alert);
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
        sample={sample}
        samples={getSamples()}
        isDisabled={isDisabled}
        deleteSample={deleteSample}
        navigateToOccurrence={navigateToOccurrence}
      />
    </Page>
  );
};

export default observer(SpeciesOccurrences);
