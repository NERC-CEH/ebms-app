import { informationCircleOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Button, InfoMessage } from '@flumens';
import { IonIcon } from '@ionic/react';
import config from 'common/config';
import Sample from 'models/sample';

type Props = {
  sample: Sample;
};

const UploadedRecordInfoMessage = ({ sample }: Props) => {
  const { webForm } = sample.getSurvey();

  return (
    <InfoMessage
      color="tertiary"
      prefix={<IonIcon src={informationCircleOutline} className="size-6" />}
      skipTranslation
      className="m-3 max-w-xl"
    >
      <T>
        This record has been submitted and cannot be edited within this App.
      </T>
      <Button
        href={`${config.backend.url}/${webForm}?sample_id=${sample.id}`}
        fill="outline"
        color="tertiary"
        className="mx-auto mt-4 max-w-sm py-1.5 text-sm"
      >
        eBMS website
      </Button>
    </InfoMessage>
  );
};

export default UploadedRecordInfoMessage;
