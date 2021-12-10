import React, { FC } from 'react';
import { PhotoPicker, Model } from '@apps';
import { useTranslation } from 'react-i18next';
import Image from 'models/media';
import config from 'common/config/config';
import utils from './imageUtils';

type Props = {
  model: Model;
};

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

    const imageModel = await utils.getImageModel(Image, image, config.dataPath);

    const isMothSurvey = model?.parent.metadata.survey === 'moth';
    if (isMothSurvey) imageModel.identify();

    return imageModel;
  }

  return <PhotoPicker getImage={getImage} model={model} />;
};

export default AppPhotoPicker;
