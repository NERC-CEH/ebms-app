import { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import { IonButton, NavContext, IonLabel } from '@ionic/react';
import i18n from 'i18next';
import { Trans as T, useTranslation } from 'react-i18next';
import { Page, Header, useAlert } from '@flumens';
import appModel from 'models/app';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import Main from './Main';

function deleteOccurrence(occ: Occurrence, alert: any) {
  const taxon = occ.attrs.taxon.scientific_name;
  alert({
    header: 'Delete',
    message: i18n.t('Are you sure you want to delete {{taxon}} ?', {
      taxon,
    }),
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => {
          occ.destroy();
        },
      },
    ],
  });
}

type Props = {
  sample: Sample;
  subSample: Sample;
};

const EditController: FC<Props> = ({ sample, subSample }) => {
  const { navigate } = useContext(NavContext);
  const { t } = useTranslation();
  const alert = useAlert();

  const increaseCount = (occ: any, is5x: boolean) => {
    if (sample.isDisabled()) return;

    if (is5x) {
      // eslint-disable-next-line no-param-reassign
      occ.attrs.count += 5;
      occ.save();
    } else {
      // eslint-disable-next-line no-param-reassign
      occ.attrs.count += 1;
      occ.save();
    }
  };

  const deleteOccurrenceWrap = (occ: Occurrence) =>
    deleteOccurrence(occ, alert);

  const toggleSpeciesSort = () => {
    const { areaSurveyListSortedByTime } = appModel.attrs;
    appModel.attrs.areaSurveyListSortedByTime = !areaSurveyListSortedByTime;
    appModel.save();
  };

  const getNextSectionButton = () => {
    const byCid = ({ cid }: Sample) => cid === subSample.cid;
    const currentSectionIndex = sample.samples.findIndex(byCid);

    const nextSectionIndex = currentSectionIndex + 1;
    const nextSectionSample = sample.samples[nextSectionIndex];
    const isLastSection = !nextSectionSample;
    if (isLastSection) {
      return null;
    }

    const nextSectionSampleId = nextSectionSample.cid;

    const navigateToSection = (e: any) => {
      e.preventDefault();
      navigate(
        `/survey/transect/${sample.cid}/edit/sections/${nextSectionSampleId}`,
        'none',
        'replace'
      );
    };

    return (
      <IonButton onClick={navigateToSection}>
        <IonLabel>
          <T>Next</T>
        </IonLabel>
      </IonButton>
    );
  };

  const { areaSurveyListSortedByTime } = appModel.attrs;

  const sectionCode = subSample.attrs.location.code || t('Section');

  return (
    <Page id="transect-sections-edit">
      <Header
        title={sectionCode}
        defaultHref="/home/user-surveys"
        rightSlot={getNextSectionButton()}
      />
      <Main
        sample={sample}
        subSample={subSample}
        deleteOccurrence={deleteOccurrenceWrap}
        increaseCount={increaseCount}
        areaSurveyListSortedByTime={areaSurveyListSortedByTime}
        onToggleSpeciesSort={toggleSpeciesSort}
        isDisabled={sample.isDisabled()}
      />
    </Page>
  );
};

export default observer(EditController);
