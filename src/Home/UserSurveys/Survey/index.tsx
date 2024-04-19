import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useToast, useAlert, Badge } from '@flumens';
import {
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
} from '@ionic/react';
import butterflyIcon from 'common/images/butterfly.svg';
import Occurrence from 'models/occurrence';
import Sample, { MothTrapLocation, useValidateCheck } from 'models/sample';
import { useUserStatusCheck } from 'models/user';
import OnlineStatus from './OnlineStatus';
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

const getSurveyLink = (sample: Sample) => {
  const survey = sample.getSurvey();

  if (!sample.isCached() && sample.isPreciseSingleSpeciesSurvey()) {
    const homeOrEditPage = sample.attrs.surveyStartTime
      ? `/survey/${survey.name}/${sample.cid}`
      : `/survey/${survey.name}/${sample.cid}/details`;

    const hasTargetSpecies = !!sample.samples.length;
    const taxonSelectPage = `/survey/${survey.name}/${sample.cid}/taxon`;
    const hrefPreciseSingleSpeciesSurvey = hasTargetSpecies
      ? homeOrEditPage
      : taxonSelectPage;
    return hrefPreciseSingleSpeciesSurvey;
  }

  const path = sample.isDetailsComplete() ? '' : '/details';

  return `/survey/${survey.name}/${sample.cid}${path}`;
};

type Props = {
  sample: Sample;
  uploadIsPrimary?: boolean;
  style?: any;
};

const Survey = ({ sample, uploadIsPrimary, style }: Props) => {
  const toast = useToast();
  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

  const showDeleteSurveyPrompt = useDeleteSurveyPrompt(sample);

  const { synchronising } = sample.remote;

  const survey = sample.getSurvey();

  let speciesCount = sample.occurrences.length;
  if (survey.name === 'area') {
    const isNotZeroCount = (occ: Occurrence) => occ.attrs.count;
    speciesCount = sample.occurrences.filter(isNotZeroCount).length;
  }

  if (survey.name === 'precise-area') {
    const hasOccurrence = (smp: Sample) => smp.occurrences.length; // from remote might not have the subsample
    speciesCount = sample.samples.filter(hasOccurrence).length;
  }

  const canShowLink = !synchronising && !survey.deprecated;
  const href = canShowLink ? getSurveyLink(sample) : '';

  function getInfo() {
    const speciesCountBadge = (
      <Badge
        skipTranslation
        className="py-[3px]"
        prefix={<IonIcon icon={butterflyIcon} />}
      >
        {speciesCount}
      </Badge>
    );

    if (survey.name === 'precise-area') {
      return !!speciesCount && speciesCountBadge;
    }

    if (survey.name === 'moth') {
      const locationName = (sample.attrs.location as MothTrapLocation)?.attrs
        ?.location?.name;

      return (
        <>
          {!!locationName && <h4>{locationName}</h4>}
          {!!speciesCount && speciesCountBadge}
        </>
      );
    }

    const locationName = sample.attrs.location?.name;
    return !!locationName && <h4>{locationName}</h4>;
  }

  const onUpload = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.upload().catch(toast.error);
  };

  const allowDeletion = !sample.isCached();

  return (
    <IonItemSliding className="survey-list-item" style={style}>
      <IonItem routerLink={href} detail={false}>
        <div className="flex w-full flex-nowrap items-center gap-2">
          <div className="flex w-full flex-col content-center gap-1 overflow-hidden">
            <h3 className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-bold">
              <T>{survey.label}</T>
            </h3>
            <div className="record-details">{getInfo()}</div>
          </div>

          <OnlineStatus
            sample={sample}
            onUpload={onUpload}
            uploadIsPrimary={uploadIsPrimary}
          />
        </div>
      </IonItem>

      {allowDeletion && (
        <IonItemOptions side="end">
          <IonItemOption color="danger" onClick={showDeleteSurveyPrompt}>
            <T>Delete</T>
          </IonItemOption>
        </IonItemOptions>
      )}
    </IonItemSliding>
  );
};

export default observer(Survey);
