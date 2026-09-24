import { Capacitor } from '@capacitor/core';
import { PhotoPicker, captureImage, device, useToast } from '@flumens';
import { isPlatform } from '@ionic/react';
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
      toast.warn('common.sorryLooksLike');
      return;
    }

    model
      .identify()
      .catch(err => (manualTrigger ? toast.error(err) : console.error(err)));
  };

  async function onAdd(shouldUseCamera: boolean) {
    try {
      const photoURLs = await captureImage(
        shouldUseCamera ? { camera: true } : { multiple: true }
      );
      if (!photoURLs.length) return;

      const getImageModel = async (imageURL: URL) =>
        (await Media.getImageModel(
          isPlatform('hybrid') ? Capacitor.convertFileSrc(imageURL) : imageURL,
          config.dataPath,
          true
        )) as unknown as Media;
      const imageModels = await Promise.all(photoURLs.map(getImageModel));

      model.media.push(...imageModels);
      model.save();

      identifySpecies();
    } catch (error) {
      toast.error(error as Error);
    }
  }

  const onRemove = async (media: Media) => {
    await media.destroy();
    identifySpecies();
  };

  const onSpeciesSelect = (suggestion: ClassifierSuggestion) => {
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
