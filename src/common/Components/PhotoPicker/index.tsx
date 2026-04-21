import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import { PhotoPicker, captureImage, device, useToast } from '@flumens';
import { isPlatform, useIonActionSheet } from '@ionic/react';
import config from 'common/config';
import Media from 'models/media';
import Occurrence, { ClassifierSuggestion } from 'models/occurrence';
import Sample from 'models/sample';
import userModel from 'models/user';
import { MachineInvolvement } from 'Survey/MothTrap/config';
import GalleryWithClassification from './GalleryWithClassification';
import ImageWithClassification from './ImageWithClassification';
import './styles.scss';

type URL = string;

export function usePromptImageSource() {
  const { t } = useTranslation();
  const [presentActionSheet] = useIonActionSheet();

  const promptImageSource = (resolve: any) => {
    presentActionSheet({
      buttons: [
        { text: t('Gallery'), handler: () => resolve(false) },
        { text: t('Camera'), handler: () => resolve(true) },
        { text: t('Cancel'), role: 'cancel', handler: () => resolve(null) },
      ],
      header: t('Choose a method to upload a photo'),
    });
  };
  const promptImageSourceWrap = () =>
    new Promise<boolean | null>(promptImageSource);

  return promptImageSourceWrap;
}

type Props = {
  model: Sample | Occurrence;
  useClassifier?: boolean;
};

const AppPhotoPicker = ({ model, useClassifier = false }: Props) => {
  const toast = useToast();

  const identifySpecies = (manualTrigger = false) => {
    if (!(model instanceof Occurrence)) return;

    if (
      !model.media.length ||
      !useClassifier ||
      !userModel.isLoggedIn() ||
      !userModel.data.verified
    )
      return;

    if (manualTrigger && !device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    model
      .identify()
      .catch((err: any) =>
        manualTrigger ? toast.error(err) : console.error(err)
      );
  };

  async function onAdd(shouldUseCamera: boolean) {
    try {
      const photoURLs = await captureImage(
        shouldUseCamera ? { camera: true } : { multiple: true }
      );
      if (!photoURLs.length) return;

      const getImageModel = async (imageURL: URL) =>
        Media.getImageModel(
          isPlatform('hybrid') ? Capacitor.convertFileSrc(imageURL) : imageURL,
          config.dataPath,
          true
        );
      const imageModels: Media[] = await Promise.all<any>(
        photoURLs.map(getImageModel)
      );

      model.media.push(...imageModels);
      model.save();

      identifySpecies();
    } catch (e: any) {
      toast.error(e);
    }
  }

  const onRemove = async (m: any) => {
    await m.destroy();
    identifySpecies();
  };

  const onSpeciesSelect = (suggestion: ClassifierSuggestion) => {
    // eslint-disable-next-line no-param-reassign
    (model as Occurrence).data.taxon = {
      foundInName: suggestion.foundInName,
      commonName: suggestion.commonName,
      taxonGroupId: suggestion.taxonGroupId,
      probability: suggestion.probability,
      scientificName: suggestion.scientificName,
      warehouseId: suggestion.warehouseId,
      machineInvolvement: MachineInvolvement.HUMAN_ACCEPTED_PREFERRED, // TODO: determine machine involvement based on current taxon and selected suggestion
      version: '1',
      suggestions: model?.media[0]?.data.species, // TODO: get the right suggestions based on the selected media, not just the first one
    };
  };

  const { isDisabled } = model;
  if (isDisabled && !model.media.length) return null;

  return (
    <PhotoPicker
      className="with-cropper"
      onAdd={onAdd}
      value={model.media}
      Image={useClassifier ? ImageWithClassification : undefined}
      Gallery={useClassifier ? GalleryWithClassification : undefined}
      onRemove={onRemove}
      galleryProps={{
        onSpeciesSelect,
        isDisabled,
        onDelete: onRemove,
        onIdentify: identifySpecies,
      }}
      isDisabled={isDisabled}
    />
  );
};

export default AppPhotoPicker;
