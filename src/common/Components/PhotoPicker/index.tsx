import { FC } from 'react';
import { PhotoPicker } from '@flumens';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import Media from 'models/media';
import config from 'common/config';
import Gallery from './Components/Galery';
import Image from './Components/Image';
import utils from './imageUtils';
import './styles.scss';

type Props = {
  model: Sample | Occurrence;
  useImageIdentifier?: boolean;
};

const AppPhotoPicker: FC<Props> = ({ model, useImageIdentifier }) => {
  const isUploaded = model.isUploaded();
  const { t } = useTranslation();

  const isMothSurvey =
    model?.parent?.metadata?.survey === 'moth' ? true : undefined;

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

    if (isMothSurvey && useImageIdentifier) imageModel.identify();

    return imageModel;
  }

  return (
    <PhotoPicker
      getImage={getImage}
      model={model}
      Image={isMothSurvey && Image}
      Gallery={isMothSurvey && Gallery}
      isDisabled={isUploaded}
    />
  );
};

export default observer(AppPhotoPicker);
