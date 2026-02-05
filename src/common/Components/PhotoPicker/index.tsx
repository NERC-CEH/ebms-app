import { observer } from 'mobx-react';
import { Capacitor } from '@capacitor/core';
import { PhotoPicker, captureImage, device } from '@flumens';
import { isPlatform } from '@ionic/react';
import config from 'common/config';
import Media from 'models/media';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import userModel from 'models/user';
import Gallery from './Components/Galery';
import Image from './Components/Image';
import './styles.scss';

type Props = {
  model: Sample | Occurrence;
  useImageIdentifier?: boolean;
};

const AppPhotoPicker = ({ model, useImageIdentifier }: Props) => {
  const { isUploaded } = model;

  const isMothSurvey =
    model?.parent?.metadata?.survey === 'moth' ? true : undefined;

  async function onAdd(shouldUseCamera: boolean) {
    const images = await captureImage(
      shouldUseCamera ? { camera: true } : { multiple: true }
    );
    if (!images.length) return;

    const getImageModel = async (image: any) => {
      const imageModel: any = await Media.getImageModel(
        isPlatform('hybrid') ? Capacitor.convertFileSrc(image) : image,
        config.dataPath,
        true
      );

      if (
        isMothSurvey &&
        useImageIdentifier &&
        userModel.isLoggedIn() &&
        device.isOnline
      )
        imageModel.identify();

      return imageModel;
    };

    const imageModels: Media[] = await Promise.all<any>(
      images.map(getImageModel)
    );

    model.media.push(...imageModels);
    model.save();
  }

  const onRemove = (m: any) => m.destroy();

  return (
    <PhotoPicker
      onAdd={onAdd}
      onRemove={onRemove}
      value={model.media}
      Image={isMothSurvey && Image}
      Gallery={isMothSurvey && Gallery}
      isDisabled={isUploaded}
    />
  );
};

export default observer(AppPhotoPicker);
