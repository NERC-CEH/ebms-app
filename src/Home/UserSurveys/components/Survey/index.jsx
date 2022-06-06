import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import {
  IonItem,
  IonLabel,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonBadge,
} from '@ionic/react';
import { useAlert, useToast } from '@flumens';
import { useUserStatusCheck } from 'models/user';
import { useValidateCheck } from 'models/sample';
import butterflyIcon from 'common/images/butterfly.svg';
import OnlineStatus from './components/OnlineStatus';
import ErrorMessage from './components/ErrorMessage';
import './styles.scss';

function useDeleteSurveyPrompt(sample) {
  const alert = useAlert();

  function deleteSurvey() {
    alert({
      header: 'Delete',
      message: 'Are you sure you want to delete this survey?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'primary',
        },
        {
          text: 'Delete',
          cssClass: 'secondary',
          handler: () => sample.destroy(),
        },
      ],
    });
  }
  return deleteSurvey;
}

function Survey({ sample }) {
  const toast = useToast();
  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

  const showDeleteSurveyPrompt = useDeleteSurveyPrompt(sample);

  const { synchronising } = sample.remote;

  const date = new Date(sample.metadata.created_on);
  const prettyDate = date.toLocaleDateString();
  const survey = sample.getSurvey();

  let speciesCount = sample.occurrences.length;
  if (survey.name === 'area') {
    const isNotZeroCount = occ => occ.attrs.count;
    speciesCount = sample.occurrences.filter(isNotZeroCount).length;
  }

  if (survey.name === 'precise-area') {
    speciesCount = sample.samples.length;
  }

  const path = sample.isDetailsComplete() ? '' : '/edit';

  const canShowLink = !synchronising && !survey.deprecated;
  const href = canShowLink && `/survey/${survey.name}/${sample.cid}${path}`;

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

  const onUpload = async e => {
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
        <OnlineStatus sample={sample} onUpload={onUpload} />
      </IonItem>
      <IonItemOptions side="end">
        <IonItemOption color="danger" onClick={showDeleteSurveyPrompt}>
          <T>Delete</T>
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
}

Survey.propTypes = {
  sample: PropTypes.object.isRequired,
};

export default observer(Survey);
