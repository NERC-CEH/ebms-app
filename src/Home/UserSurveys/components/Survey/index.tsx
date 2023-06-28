import { FC, SyntheticEvent } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useToast, useAlert, date as dateHelp } from '@flumens';
import {
  IonItem,
  IonLabel,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonBadge,
} from '@ionic/react';
import butterflyIcon from 'common/images/butterfly.svg';
import Occurrence from 'models/occurrence';
import Sample, { useValidateCheck } from 'models/sample';
import { useUserStatusCheck } from 'models/user';
import ErrorMessage from './components/ErrorMessage';
import OnlineStatus from './components/OnlineStatus';
import './styles.scss';

function useDeleteSurveyPrompt(sample: Sample) {
  const alert = useAlert();

  function deleteSurvey() {
    alert({
      header: 'Delete',
      message: 'Are you sure you want to delete this survey?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => sample.destroy(),
        },
      ],
    });
  }
  return deleteSurvey;
}

type Props = {
  sample: Sample;
  hasManyPending?: boolean;
};

const Survey: FC<Props> = ({ sample, hasManyPending }) => {
  const toast = useToast();
  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

  const showDeleteSurveyPrompt = useDeleteSurveyPrompt(sample);

  const { synchronising } = sample.remote;

  const prettyDate = dateHelp.print(sample.metadata.createdOn, true);
  const survey = sample.getSurvey();

  let speciesCount = sample.occurrences.length;
  if (survey.name === 'area') {
    const isNotZeroCount = (occ: Occurrence) => occ.attrs.count;
    speciesCount = sample.occurrences.filter(isNotZeroCount).length;
  }

  if (survey.name === 'precise-area') {
    speciesCount = sample.samples.length;
  }

  const path = sample.isDetailsComplete() ? '' : '/edit';

  const canShowLink = !synchronising && !survey.deprecated;
  const hrefRemainingSurvey =
    canShowLink && `/survey/${survey.name}/${sample.cid}${path}`;

  const hasTargetSpecies = !!sample.samples.length;

  const homeOrEditPage = sample.attrs.surveyStartTime
    ? `/survey/${survey.name}/${sample.cid}/edit`
    : `/survey/${survey.name}/${sample.cid}/edit/details`;

  const taxonSelectPage = `/survey/${survey.name}/${sample.cid}/edit/taxon`;
  const hrefPreciseSingleSpeciesSurvey = hasTargetSpecies
    ? homeOrEditPage
    : taxonSelectPage;

  const surveyRoutes = sample.isPreciseSingleSpeciesSurvey()
    ? hrefPreciseSingleSpeciesSurvey
    : hrefRemainingSurvey;

  const href: any = canShowLink && surveyRoutes;
  function getSampleInfo() {
    const label = (
      <>
        <h3>
          <b>
            <T>{survey.label}</T>
          </b>
        </h3>
        <IonLabel className="pretty-date">{prettyDate}</IonLabel>
      </>
    );

    if (survey.name === 'precise-area') {
      return (
        <IonLabel class="ion-text-wrap">
          {label}
          <IonBadge color="medium">
            <IonIcon icon={butterflyIcon} /> {speciesCount}
          </IonBadge>
        </IonLabel>
      );
    }

    return <IonLabel class="ion-text-wrap">{label}</IonLabel>;
  }

  const onUpload = async (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.upload().catch(toast.error);
  };

  return (
    <IonItemSliding class="survey-list-item">
      <ErrorMessage sample={sample} />
      <IonItem routerLink={href} detail={canShowLink}>
        {getSampleInfo()}
        <OnlineStatus
          sample={sample}
          onUpload={onUpload}
          hasManyPending={hasManyPending}
        />
      </IonItem>
      <IonItemOptions side="end">
        <IonItemOption color="danger" onClick={showDeleteSurveyPrompt}>
          <T>Delete</T>
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default observer(Survey);
