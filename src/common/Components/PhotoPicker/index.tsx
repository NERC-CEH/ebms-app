import React, { FC } from 'react';
import { PhotoPicker, Model } from '@apps';
import { useTranslation } from 'react-i18next';
import { IonIcon, IonButton, IonSpinner } from '@ionic/react';
import { observer } from 'mobx-react';
import { warningOutline, close } from 'ionicons/icons';
import Media from 'models/media';
import config from 'common/config/config';
import utils from './imageUtils';
import './styles.scss';

type Props = {
  model: Model;
};

type ImageProps = {
  media: typeof Media;
  isDisabled: boolean;
  onDelete: any;
  onClick: any;
};

const ImageWrap = ({
  media,
  isDisabled,
  onDelete,
  onClick,
}: {
  media: any;
  isDisabled: any;
  onDelete: any;
  onClick: any;
}): JSX.Element => {
  const { i18n } = useTranslation();

  const showWarning = media.doesTaxonMatchParent(); // calculate from media.parent

  const showLoading = media.identification.identifying;

  if (showWarning) {
    const { taxon } = media.attrs.species[0];

    // eslint-disable-next-line no-param-reassign
    media.attrs.footer = i18n.t(
      'Warning! - our image classifier has detected this is a {{taxon}} species',
      { taxon }
    );
  }

  return (
    <div className="img">
      {!isDisabled && (
        <IonButton fill="clear" class="delete" onClick={onDelete}>
          <IonIcon icon={close} />
        </IonButton>
      )}
      <img src={media.attrs.thumbnail} onClick={onClick} />

      {!showLoading && <IonSpinner slot="end" className="identifying" />}
      {showWarning && (
        <IonIcon className="warning-icon" icon={warningOutline} />
      )}
    </div>
  );
};
const Image: any = observer(ImageWrap);

const AppPhotoPicker: FC<Props> = ({ model }) => {
  const { t } = useTranslation();

  const promptOptions = {
    promptLabelHeader: t('Choose a method to upload a photo'),
    promptLabelPhoto: t('Gallery'),
    promptLabelPicture: t('Camera'),
    promptLabelCancel: t('Cancel'),
  };

  async function getImage() {
    const image = await utils.getImage(promptOptions);

    if (!image) {
      return null;
    }

    const imageModel = await utils.getImageModel(Media, image, config.dataPath);

    const isMothSurvey = model?.parent.metadata.survey === 'moth';
    if (isMothSurvey) imageModel.identify();

    return imageModel;
  }

  return <PhotoPicker getImage={getImage} model={model} Image={Image} />;
};

export default observer(AppPhotoPicker);
