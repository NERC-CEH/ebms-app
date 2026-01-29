import { useContext } from 'react';
import { observer } from 'mobx-react';
import { mapOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useToast, useAlert, Badge } from '@flumens';
import {
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  NavContext,
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

  if (sample.isStored && sample.isPreciseSingleSpeciesSurvey()) {
    const homeOrEditPage = sample.data.surveyStartTime
      ? `/survey/${survey.name}/${sample.id || sample.cid}`
      : `/survey/${survey.name}/${sample.id || sample.cid}/details`;

    const hasTargetSpecies = !!sample.samples.length;
    const taxonSelectPage = `/survey/${survey.name}/${sample.id || sample.cid}/taxon`;
    const hrefPreciseSingleSpeciesSurvey = hasTargetSpecies
      ? homeOrEditPage
      : taxonSelectPage;
    return hrefPreciseSingleSpeciesSurvey;
  }

  const path = sample.isDetailsComplete() ? '' : '/details';

  return `/survey/${survey.name}/${sample.id || sample.cid}${path}`;
};

type Props = {
  sample: Sample;
  uploadIsPrimary?: boolean;
  style?: any;
};

const Survey = ({ sample, uploadIsPrimary, style }: Props) => {
  const { navigate } = useContext(NavContext);
  const toast = useToast();
  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

  const showDeleteSurveyPrompt = useDeleteSurveyPrompt(sample);

  const synchronising = sample.isSynchronising;

  const survey = sample.getSurvey();

  let speciesCount = sample.occurrences.length;
  if (survey.name === 'area') {
    const isNotZeroCount = (occ: Occurrence) => occ.data.count;
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
      const { area }: any = sample.data.location || {};

      return (
        <div className="flex justify-start gap-1">
          {!!speciesCount && speciesCountBadge}

          {!!area && (
            <Badge
              skipTranslation
              className="ml-2"
              prefix={<IonIcon icon={mapOutline} />}
            >
              {area}m²
            </Badge>
          )}
        </div>
      );
    }

    if (survey.name === 'moth') {
      const locationName = (sample.data.location as MothTrapLocation)?.data
        ?.location?.name;

      return (
        <>
          {!!locationName && (
            <div className="text-sm line-clamp-1">{locationName}</div>
          )}
          {!!speciesCount && speciesCountBadge}
        </>
      );
    }

    const locationName = sample.data.location?.name;
    return (
      !!locationName && (
        <Badge skipTranslation prefix={<IonIcon icon={mapOutline} />}>
          {locationName}
        </Badge>
      )
    );
  }

  const onUpload = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const isValid = checkSampleStatus();
    if (!isValid) return;
    sample.upload().catch(toast.error);
  };

  const allowDeletion = sample.isStored;

  const openItem = () => {
    if (sample.isSynchronising) return; // fixes button onPressUp and other accidental navigation
    navigate(href);
  };

  const { groupId, group } = sample.data;
  const hasGroup = !!groupId || !!group;

  return (
    <IonItemSliding className="survey-list-item" style={style}>
      <IonItem onClick={openItem} detail={false}>
        {hasGroup && (
          <div className="absolute left-0 z-[1000] h-full w-[7px] bg-tertiary-600" />
        )}

        <div className="flex w-full flex-nowrap items-center gap-2 pl-4">
          <div className="flex w-full flex-col content-center gap-1 overflow-hidden">
            <h3 className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-bold! my-0!">
              <T>{survey.label}</T>
            </h3>
            <div>{getInfo()}</div>
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
