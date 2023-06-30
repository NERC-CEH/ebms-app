import { FC, SyntheticEvent } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useToast, useAlert } from '@flumens';
import {
  IonItem,
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
  uploadIsPrimary?: boolean;
  style?: any;
};

const Survey: FC<Props> = ({ sample, uploadIsPrimary, style }) => {
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

  function getInfo() {
    if (survey.name === 'precise-area') {
      return (
        <div className="survey-info-container">
          <h3>
            <T>{survey.label}</T>
          </h3>

          <div className="record-details">
            {!!speciesCount && (
              <IonBadge color="medium">
                <IonIcon icon={butterflyIcon} /> {speciesCount}
              </IonBadge>
            )}
          </div>
        </div>
      );
    }

    if (survey.name === 'moth') {
      const locationName = sample.attrs.location?.attrs?.location?.name;

      return (
        <div className="survey-info-container">
          <h3>
            <T>{survey.label}</T>
          </h3>

          <div className="record-details">
            {!!locationName && <h4>{locationName}</h4>}
            {!!speciesCount && (
              <IonBadge color="medium">
                <IonIcon icon={butterflyIcon} /> {speciesCount}
              </IonBadge>
            )}
          </div>
        </div>
      );
    }

    const locationName = sample.attrs.location?.name;

    return (
      <div className="survey-info-container">
        <h3>
          <T>{survey.label}</T>
        </h3>

        <div className="record-details">
          {!!locationName && <h4>{locationName}</h4>}
        </div>
      </div>
    );
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
    <IonItemSliding class="survey-list-item" style={style}>
      <IonItem routerLink={href} detail={false}>
        {getInfo()}

        <OnlineStatus
          sample={sample}
          onUpload={onUpload}
          hasManyPending={uploadIsPrimary}
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
