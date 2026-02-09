import { observer } from 'mobx-react';
import clsx from 'clsx';
import { Trans as T } from 'react-i18next';
import wkt from 'wellknown';
import { Capacitor } from '@capacitor/core';
import {
  Block,
  ChoiceInputConf,
  InfoMessage,
  Main,
  PhotoPicker,
  captureImage,
  transformToLatLon,
  useModalNav,
  getGeomCenter,
  getGeomWKT,
  Header,
} from '@flumens';
import { isPlatform } from '@ionic/core';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonItem,
  IonTitle,
  IonToolbar,
  IonList,
  IonLabel,
} from '@ionic/react';
import AreaDraw, { Shape } from 'common/Components/AreaDraw';
import config from 'common/config';
import groups from 'common/models/collections/groups';
import LocationModel, { dtoSchema } from 'common/models/location';
import Media from 'common/models/media';
import HeaderButton from 'Survey/common/HeaderButton';
import { useLocation } from '.';
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

const getLocationAttrsFromShape = (shape?: Shape) => ({
  boundaryGeom: shape ? getGeomWKT(shape) : undefined,
  lat: shape ? `${getGeomCenter(shape)[1]}` : undefined,
  lon: shape ? `${getGeomCenter(shape)[0]}` : undefined,
  centroidSrefSystem: '4326',
  centroidSref: shape
    ? `${getGeomCenter(shape)[1]} ${getGeomCenter(shape)[0]}`
    : undefined,
});

const getShapeFromGeom = (geom?: string | null): Shape | undefined => {
  if (!geom) return undefined;
  const geomParsed = wkt.parse(geom) as any;

  geomParsed.coordinates = transformToLatLon(geomParsed);
  return geomParsed;
};

type Props = {
  onSave: (location: LocationModel) => Promise<boolean>;
};

const Details = ({ onSave }: Props) => {
  const nav = useModalNav();
  const { location } = useLocation();

  const group = groups.find(g => g.id === location.metadata.groupId);
  const isAgroecologyTRANSECT = group?.data.title.includes('Agroecology');
  const isCAP4GI = group?.data.title.includes('CAP4GI');
  const isVielFalterGarten = group?.data.title.includes('VielFalterGarten');
  const isUNPplus = group?.data.title.includes('UNPplus');

  const projectAttr = {
    id: 'groupId',
    type: 'choiceInput',
    title: 'Project',
    appearance: 'button',
    choices: [
      { title: 'None', dataName: '' },
      ...groups.map(g => ({ title: g.data.title, dataName: g.id! })),
    ],
  } as const satisfies ChoiceInputConf;

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
    location.media.push(imageModels[0]);
  }

  const onRemovePhoto = (m: Media) => location.media.remove(m);

  const { success: isValidLocation } = dtoSchema.safeParse(location.data);

  const onDismiss = () => nav.dismiss();

  const onSaveWrap = async () => {
    if (!isValidLocation) return;

    const success = await onSave(location);
    if (!success) return;

    onDismiss();
  };

  const getBlockAttrs = (attrConf: any) => ({
    record: location,
    block: attrConf,
    onChange: (newVal: any) =>
      Object.assign(location.data, { [attrConf.id]: newVal }),
  });

  const isOtherSiteSize =
    (location as any)[siteAreaAttr.id] === OTHER_SITE_SIZE_VALUE;

  const onChangeShape = (newShape?: Shape): void => {
    Object.assign(location.data, getLocationAttrsFromShape(newShape));
    nav.pop();
  };

  const navigateToArea = () =>
    nav.push(() => (
      <>
        <Header title="Draw area" />
        <AreaDraw
          shape={getShapeFromGeom(location.data.boundaryGeom)}
          onChange={onChangeShape}
        />
      </>
    ));

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onDismiss}>
              <T>Cancel</T>
            </IonButton>
          </IonButtons>
          <IonTitle>
            <T>New site</T>
          </IonTitle>
          <IonButtons slot="end">
            <HeaderButton isInvalid={!isValidLocation} onClick={onSaveWrap}>
              Save
            </HeaderButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <Main>
        <IonList lines="full" className="m-3 flex flex-col gap-3">
          <div className="rounded-list">
            <Block
              {...getBlockAttrs(siteNameAttr)}
              block={{
                ...siteNameAttr,
                className: clsx(
                  '[&>*>*>input]:text-right',
                  !location.data[siteNameAttr.id] &&
                    '[&>*>*>label]:text-warning'
                ),
              }}
            />

            <IonItem detail onClick={navigateToArea} className="warning">
              <IonLabel color={location.data.boundaryGeom ? '' : 'warning'}>
                Area
              </IonLabel>
            </IonItem>

            <Block record={location.metadata} block={projectAttr} />

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

          <div className="rounded-list mt-3">
            {(isAgroecologyTRANSECT || isCAP4GI) && (
              <>
                <Block {...getBlockAttrs(landscapeFeaturesAttr)} />
                <InfoMessage inline>
                  Features located within a 50-meter radius.
                </InfoMessage>
                <Block record={location} block={otherLandscapeFeaturesAttr} />
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
              <T>Please upload site photos</T>
            </h3>
            <div className="rounded-list">
              <PhotoPicker
                onAdd={onAddPhoto}
                onRemove={onRemovePhoto}
                value={location.media}
              />
              <InfoMessage inline>
                Optimally in the direction to North, East, South and West.
              </InfoMessage>
            </div>
          </div>
        </IonList>
      </Main>
    </>
  );
};

export default observer(Details);
