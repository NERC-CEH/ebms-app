import { useContext, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { resizeOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { device, Location, useLoader, useToast } from '@flumens';
import { IonIcon, IonPage, isPlatform, NavContext } from '@ionic/react';
import projects from 'common/models/collections/projects';
import ProjectModel from 'common/models/project';
import locations from 'models/collections/locations';
import LocationModel, { RemoteAttributes } from 'models/location';
import Sample, { AreaCountLocation } from 'models/sample';
import userModel from 'models/user';
import Header from './Header';
import Main from './Main';
import NewLocationModal from './NewLocationModal';
import './styles.scss';

type Props = {
  sample: Sample;
};

const AreaController = ({ sample }: Props) => {
  const { goBack } = useContext(NavContext);
  const loader = useLoader();
  const toast = useToast();

  const toggleGPStracking = (on: boolean) => {
    sample.toggleGPStracking(on);
  };

  const setLocation = (shape: any) => {
    sample.setLocation(shape);
  };

  const location = (sample.attrs.location as AreaCountLocation) || {};
  const isGPSTracking = sample.isGPSRunning();
  const { area } = location;

  let infoText;
  if (area) {
    infoText = (
      <div className="text-with-icon-wrapper">
        <IonIcon icon={resizeOutline} />
        <T>Selected area</T>: {area.toLocaleString()} m²
      </div>
    );
  } else {
    infoText = (
      <>
        <T>Please draw your area on the map</T>
        {isGPSTracking && (
          <div>
            <T>Disable the GPS tracking to enable the drawing tools.</T>
          </div>
        )}
      </>
    );
  }

  const isDisabled = sample.isDisabled();

  const isAreaShape = location.shape?.type === 'Polygon';

  const onSelectHistoricalLocation = (selectedLoc: Location) => {
    if (sample.isGPSRunning()) sample.stopGPS();

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });

    // eslint-disable-next-line no-param-reassign
    sample.attrs.location = selectedLoc as AreaCountLocation;
    sample.save();
    goBack();
  };

  const [isNewLocationModalOpen, setNewLocationModalOpen] = useState(false);

  const modal = useRef<HTMLIonModalElement>(null);
  const onCreateProjectLocation = () => modal.current?.present();
  const onSelectProjectLocation = (loc: LocationModel) => {
    if (!sample.attrs.location) {
      sample.attrs.location = {} as any; // eslint-disable-line
    }

    const shouldUnselect = sample.attrs.site?.id === loc.id;
    if (shouldUnselect) {
      sample.attrs.site = undefined; // eslint-disable-line
    } else {
      sample.attrs.site = JSON.parse(JSON.stringify(loc.attrs)); // eslint-disable-line
    }

    sample.save();
    goBack();
  };

  const page = useRef(null);

  const [presentingElement, setPresentingElement] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    setPresentingElement(page.current);
  }, []);

  const refreshLocations = () => {
    if (
      isDisabled ||
      !userModel.isLoggedIn() ||
      !userModel.attrs.verified ||
      !device.isOnline
    )
      return;

    locations.fetch();
  };
  useEffect(refreshLocations, []);

  const onCloseLocationModal = () => setNewLocationModalOpen(false);

  const onSaveNewLocation = async (newSiteAttrs: RemoteAttributes) => {
    if (
      !userModel.isLoggedIn() ||
      !userModel.attrs.verified ||
      !device.isOnline
    )
      return false;

    console.log('Saving location', newSiteAttrs);

    try {
      await loader.show('Please wait...');

      const byId = (p: ProjectModel) => p.id === sample.attrs.project?.id;
      const project = projects.find(byId);
      if (!project) throw new Error('Project was not found');

      const newSite = new LocationModel({
        skipStore: true,
        attrs: newSiteAttrs as any, // any - to fix Moth trap attrs
      });
      await newSite.saveRemote();

      await project.addLocation(newSite);
      await refreshLocations();

      toast.success('Successfully saved a location.');
    } catch (err: any) {
      toast.error(err);
      loader.hide();
      return false;
    }

    loader.hide();
    return true;
  };

  return (
    <IonPage id="area" ref={page}>
      <Header
        toggleGPStracking={toggleGPStracking}
        isGPSTracking={isGPSTracking}
        isDisabled={isDisabled}
        infoText={infoText}
        isAreaShape={isAreaShape}
      />
      <Main
        sample={sample}
        isGPSTracking={isGPSTracking}
        setLocation={setLocation}
        isDisabled={isDisabled}
        onSelectHistoricalLocation={onSelectHistoricalLocation}
        onCreateProjectLocation={onCreateProjectLocation}
        onSelectProjectLocation={onSelectProjectLocation}
        isFetchingLocations={locations.fetching.isFetching}
      />
      <NewLocationModal
        ref={modal}
        presentingElement={presentingElement}
        isOpen={isNewLocationModalOpen}
        onCancel={onCloseLocationModal}
        onSave={onSaveNewLocation}
        project={sample.attrs.project!}
        location={location}
      />
    </IonPage>
  );
};

export default observer(AreaController);
