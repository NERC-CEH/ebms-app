import { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import { IonButton, NavContext } from '@ionic/react';
import i18n from 'i18next';
import { Trans as T, useTranslation } from 'react-i18next';
import { Page, Header, useAlert } from '@flumens';
import appModel from 'models/app';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import Main from './Main';

function increaseCount(occ: Occurrence) {
  occ.attrs.count++; // eslint-disable-line no-param-reassign
  occ.save();
}

function decreaseCount(occ: Occurrence) {
  const { count } = occ.attrs;
  if (count <= 1) {
    return;
  }

  occ.attrs.count--; // eslint-disable-line no-param-reassign
  occ.save();
}

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
        cssClass: 'primary',
      },
      {
        text: 'Delete',
        cssClass: 'secondary',
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
        <T>Next</T>
      </IonButton>
    );
  };

  const { areaSurveyListSortedByTime } = appModel.attrs;
  const isDisabled = !!sample.metadata.synced_on;

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
        decreaseCount={decreaseCount}
        areaSurveyListSortedByTime={areaSurveyListSortedByTime}
        onToggleSpeciesSort={toggleSpeciesSort}
        isDisabled={isDisabled}
      />
    </Page>
  );
};

export default observer(EditController);