import { forwardRef, useEffect, useState } from 'react';
import { observable, IObservableArray } from 'mobx';
import clsx from 'clsx';
import { Trans as T, useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Capacitor } from '@capacitor/core';
import {
  Block,
  InfoMessage,
  Location,
  Main,
  PhotoPicker,
  captureImage,
} from '@flumens';
import { isPlatform } from '@ionic/core';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  useIonActionSheet,
} from '@ionic/react';
import config from 'common/config';
import { getGeomCenter, getGeomString } from 'common/helpers/location';
import LocationModel, { GROUP_SITE_TYPE } from 'common/models/location';
import Media from 'common/models/media';
import { Group } from 'common/models/sample';
import HeaderButton from 'Survey/common/HeaderButton';
import {
  OTHER_SITE_SIZE_VALUE,
  buildingsNumberAttr,
  commentAttr,
  cornNumberAttr,
  croppingNumberAttr,
  customAreaSizeAttr,
  fallowNumberAttr,
  fertilizedAttr,
  forestNumberAttr,
  gardenNumberAttr,
  gardensNumberAttr,
  grainsNumberAttr,
  grassMownAttr,
  grassProportionAttr,
  grasslandNumberAttr,
  habitatAttr,
  landNumberAttr,
  landOwnershipAttr,
  landscapeFeaturesAttr,
  legumesNumberAttr,
  managedGrasslandNumberAttr,
  numberAttr,
  orchardManagedNumberAttr,
  orchardNumberAttr,
  otherFertilizerAttr,
  otherLandscapeFeaturesAttr,
  otherPesticideAttr,
  pesticidesAttr,
  plantationNumberAttr,
  rapeseedNumberAttr,
  responsibleAttr,
  riverNumberAttr,
  siteAreaAttr,
  siteNameAttr,
  speciesAttr,
  treeNumberAttr,
  vegetablesNumberAttr,
  wastelandNumberAttr,
  waterNumberAttr,
  wetlandNumberAttr,
  woodlandNumberAttr,
} from './config';

type Site = z.infer<typeof LocationModel.remoteSchema>;

const useDismissHandler = (newLocation: any) => {
  const { t } = useTranslation();
  const [present] = useIonActionSheet();

  const canDismiss = (force?: boolean) =>
    new Promise<boolean>(resolve => {
      const isEmpty = !newLocation.name && !newLocation.comment;
      if (isEmpty || force) {
        resolve(true);
        return;
      }

      present({
        header: t('Are you sure?'),
        subHeader: t('This will discard the form data.'),
        buttons: [
          { text: t('Yes'), role: 'confirm' },
          { text: t('No'), role: 'cancel' },
        ],
        onWillDismiss: ev => resolve(ev.detail.role === 'confirm'),
      });
    });

  return canDismiss;
};

const getNewSiteSeed = (shape?: Location['shape']): Partial<Site> => ({
  locationTypeId: GROUP_SITE_TYPE,
  boundaryGeom: shape ? getGeomString(shape) : undefined,
  lat: shape ? `${getGeomCenter(shape)[1]}` : undefined,
  lon: shape ? `${getGeomCenter(shape)[0]}` : undefined,
  centroidSrefSystem: '4326',
  centroidSref: shape
    ? `${getGeomCenter(shape)[1]} ${getGeomCenter(shape)[0]}`
    : undefined,
  name: undefined,
});

type Props = {
  presentingElement: any;
  isOpen: any;
  onCancel: any;
  onSave: (location: Site, photos: Media[]) => Promise<boolean>;
  group: Group;
  shape?: Location['shape'];
};

const NewLocationModal = (
  { presentingElement, isOpen, onCancel, onSave, group, shape }: Props,
  ref: any
) => {
  const [newLocation, setNewLocation] = useState<Partial<Site>>(
    observable(getNewSiteSeed(shape))
  );
  const [photos, setPhotos] = useState<IObservableArray<Media>>(observable([]));

  async function onAddPhoto() {
    const images = await captureImage({ camera: true });
    if (!images.length) return;

    const getImageModel = async (image: any) => {
      const imageModel: any = await Media.getImageModel(
        isPlatform('hybrid') ? Capacitor.convertFileSrc(image) : image,
        config.dataPath,
        true
      );

      return imageModel;
    };

    const imageModels: Media[] = await Promise.all<any>(
      images.map(getImageModel)
    );
    photos.push(imageModels[0]);
    setPhotos(photos);
  }

  const onRemovePhoto = (m: any) => {
    photos.remove(m);
    setPhotos(photos);
  };

  const resetState = () => {
    setPhotos(observable([]));
    setNewLocation(observable(getNewSiteSeed(shape)));
  };
  useEffect(resetState, [shape]);

  const { success: isValidLocation } =
    LocationModel.remoteSchema.safeParse(newLocation);

  const canDismiss = useDismissHandler(newLocation || {});

  const cleanUp = () => resetState();

  const dismiss = async (force?: boolean) => {
    const closing = await ref.current?.dismiss(force);
    if (closing) onCancel();
  };

  const onSaveWrap = async () => {
    if (!isValidLocation) return;

    const success = await onSave(newLocation as Site, photos);
    if (!success) return;

    dismiss(true);
  };

  const isAgroecologyTRANSECT = group?.title.includes('Agroecology');
  const isCAP4GI = group?.title.includes('CAP4GI');
  const isVielFalterGarten = group?.title.includes('VielFalterGarten');
  const isUNPplus = group?.title.includes('UNPplus');

  const getBlockAttrs = (attrConf: any) => ({
    record: newLocation,
    block: attrConf,
    onChange: (newVal: any) => {
      setNewLocation({ ...newLocation, [attrConf.id]: newVal });
      return null;
    },
  });

  const isOtherSiteSize =
    (newLocation as any)[siteAreaAttr.id] === OTHER_SITE_SIZE_VALUE;

  return (
    <>
      <IonModal
        ref={ref}
        isOpen={isOpen}
        backdropDismiss={false}
        presentingElement={presentingElement}
        canDismiss={canDismiss}
        onWillDismiss={cleanUp}
        focusTrap={false}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => dismiss()}>
                <T>Cancel</T>
              </IonButton>
            </IonButtons>
            <IonTitle className={clsx(isPlatform('ios') && 'pr-[130px]')}>
              <T>New location</T>
            </IonTitle>
            <IonButtons slot="end">
              <HeaderButton isInvalid={!isValidLocation} onClick={onSaveWrap}>
                Save
              </HeaderButton>
            </IonButtons>
          </IonToolbar>
          <div className="bg-tertiary-600 p-1 text-center text-sm text-white">
            {group?.title}
          </div>
        </IonHeader>

        <Main>
          <div className="m-3 flex flex-col gap-3">
            <div className="rounded-list">
              <Block {...getBlockAttrs(siteNameAttr)} />

              {(isAgroecologyTRANSECT ||
                isCAP4GI ||
                isVielFalterGarten ||
                isUNPplus) && (
                <>
                  <Block {...getBlockAttrs(siteAreaAttr)} />
                  {isOtherSiteSize && (
                    <Block {...getBlockAttrs(customAreaSizeAttr)} />
                  )}
                  <InfoMessage inline>
                    Approximate size of your observation site.
                  </InfoMessage>
                </>
              )}

              {(isVielFalterGarten || isUNPplus) && (
                <Block {...getBlockAttrs(habitatAttr)} />
              )}
            </div>

            {(isAgroecologyTRANSECT || isCAP4GI) && (
              <div>
                <h3 className="list-title">
                  <T>Habitats/land uses (total should be 100%)</T>
                </h3>
                <div className="rounded-list">
                  <Block {...getBlockAttrs(grainsNumberAttr)} />
                  <Block {...getBlockAttrs(vegetablesNumberAttr)} />
                  <Block {...getBlockAttrs(rapeseedNumberAttr)} />
                  <Block {...getBlockAttrs(cornNumberAttr)} />
                  <Block {...getBlockAttrs(legumesNumberAttr)} />
                  <Block {...getBlockAttrs(croppingNumberAttr)} />
                  <Block {...getBlockAttrs(fallowNumberAttr)} />
                  <Block {...getBlockAttrs(managedGrasslandNumberAttr)} />
                  <Block {...getBlockAttrs(grasslandNumberAttr)} />
                  <Block {...getBlockAttrs(orchardNumberAttr)} />
                  <Block {...getBlockAttrs(orchardManagedNumberAttr)} />
                  <Block {...getBlockAttrs(numberAttr)} />
                  <Block {...getBlockAttrs(wastelandNumberAttr)} />
                  <Block {...getBlockAttrs(woodlandNumberAttr)} />
                  <Block {...getBlockAttrs(forestNumberAttr)} />
                  <Block {...getBlockAttrs(plantationNumberAttr)} />
                  <Block {...getBlockAttrs(gardenNumberAttr)} />
                  <Block {...getBlockAttrs(gardensNumberAttr)} />
                  <Block {...getBlockAttrs(buildingsNumberAttr)} />
                  <Block {...getBlockAttrs(waterNumberAttr)} />
                  <Block {...getBlockAttrs(riverNumberAttr)} />
                  <Block {...getBlockAttrs(wetlandNumberAttr)} />
                  <Block {...getBlockAttrs(landNumberAttr)} />
                </div>
              </div>
            )}

            <div className="rounded-list">
              {(isAgroecologyTRANSECT || isCAP4GI) && (
                <>
                  <Block {...getBlockAttrs(landscapeFeaturesAttr)} />
                  <InfoMessage inline>
                    Features located within a 50-meter radius.
                  </InfoMessage>
                  <Block
                    record={newLocation}
                    block={otherLandscapeFeaturesAttr}
                  />
                </>
              )}

              {(isVielFalterGarten || isUNPplus) && (
                <>
                  <Block {...getBlockAttrs(treeNumberAttr)} />
                  <Block {...getBlockAttrs(grassProportionAttr)} />
                </>
              )}

              {(isAgroecologyTRANSECT ||
                isCAP4GI ||
                isVielFalterGarten ||
                isUNPplus) && (
                <>
                  <Block {...getBlockAttrs(grassMownAttr)} />
                  <Block {...getBlockAttrs(fertilizedAttr)} />
                  <Block {...getBlockAttrs(otherFertilizerAttr)} />
                  <Block {...getBlockAttrs(pesticidesAttr)} />
                  <Block {...getBlockAttrs(otherPesticideAttr)} />
                </>
              )}

              {(isVielFalterGarten || isUNPplus) && (
                <>
                  <Block {...getBlockAttrs(speciesAttr)} />
                  <Block {...getBlockAttrs(landOwnershipAttr)} />
                  <Block {...getBlockAttrs(responsibleAttr)} />
                </>
              )}

              <Block {...getBlockAttrs(commentAttr)} />
            </div>

            <div>
              <h3 className="list-title">
                <T>Site photos</T>
              </h3>
              <div className="rounded-list">
                <PhotoPicker
                  onAdd={onAddPhoto}
                  onRemove={onRemovePhoto}
                  value={photos}
                />
                <InfoMessage inline>
                  Optimally in the direction to North, East, South and West.
                </InfoMessage>
              </div>
            </div>
          </div>
        </Main>
      </IonModal>
    </>
  );
};

export default forwardRef(NewLocationModal);
