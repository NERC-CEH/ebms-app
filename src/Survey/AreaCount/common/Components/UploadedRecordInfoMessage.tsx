import { informationCircleOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Button, InfoMessage } from '@flumens';
import { IonIcon } from '@ionic/react';
import config from 'common/config';
import Sample from 'models/sample';

type Props = {
  sample: Sample;
};

const UploadedRecordInforMesasge = ({ sample }: Props) => {
  const { webForm } = sample.getSurvey();

  return (
    <InfoMessage
      color="tertiary"
      startAddon={<IonIcon src={informationCircleOutline} className="size-6" />}
      skipTranslation
    >
      <T>
        This record has been submitted and cannot be edited within this App.
      </T>
      <Button
        href={`${config.backend.url}/${webForm}?sample_id=${sample.id}`}
        fill="outline"
        color="primary"
        className="mx-auto mt-5 max-w-sm"
      >
        eBMS website
      </Button>
    </InfoMessage>
  );
};

export default UploadedRecordInforMesasge;
