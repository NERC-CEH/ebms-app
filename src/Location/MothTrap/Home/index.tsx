/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
import { FC, useContext } from 'react';
import Location, { Lamp, useValidateCheck } from 'models/location';
import UUID from 'common/helpers/UUID';
import { useRouteMatch } from 'react-router';
import { observer } from 'mobx-react';
import { useUserStatusCheck } from 'models/user';
import { Page, Header, useAlert, useToast } from '@flumens';
import { IonButton, NavContext } from '@ionic/react';
import { Trans as T } from 'react-i18next';
// import BackButton from '../Components/BackButton';
import Main from './Main';
import './styles.scss';

interface Props {
  sample: Location;
}

function useDeleteLampPrompt() {
  const alert = useAlert();

  const showDeletePrompt = () => {
    const showPrompt = (resolve: any) => {
      alert({
        header: 'Delete',
        message: (
          <T>
            Are you sure you want to delete this lamp entry from the moth trap?
          </T>
        ),
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => resolve(false),
          },
          {
            text: 'Discard',
            role: 'destructive',
            handler: () => resolve(true),
          },
        ],
      });
    };

    return new Promise(showPrompt);
  };

  return showDeletePrompt;
}

const MothTrapSetup: FC<Props> = ({ sample: location }) => {
  const checkUserStatus = useUserStatusCheck();

  const { navigate, goBack } = useContext(NavContext);
  const validateLocation = useValidateCheck();
  const { url } = useRouteMatch();
  const toast = useToast();
  const showDeleteLampPrompt = useDeleteLampPrompt();

  const deleteLamp = async (entry: Lamp) => {
    const byLamp = (lamp: Lamp) => lamp.cid === entry.cid;
    const lampIndex = location.attrs.lamps.findIndex(byLamp);

    const change = await showDeleteLampPrompt();
    if (change) {
      location.attrs.lamps.splice(lampIndex, 1); // 2nd parameter means remove one item only
      location.save();
    }
  };

  const onSubmit = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const invalids = validateLocation(location);
    if (invalids) return;

    location.metadata.saved = true;
    location.save();

    goBack();

    location.saveRemote().catch(toast.error);
  };

  const addNewLamp = () => {
    const cid = UUID();

    location.attrs.lamps.push({
      cid,
      attrs: { type: '', quantity: 1, description: '' },
    });
    location.save();

    navigate(`${url}/lamps/${cid}`);
  };

  const { saved } = location.metadata;

  const getFinishButton = () => {
    const label = !saved ? <T>Save</T> : <T>Upload</T>;

    return <IonButton onClick={onSubmit}>{label}</IonButton>;
  };

  // const CancelButtonWrap = () => <BackButton location={location} />;

  return (
    <Page id="moth-trap-setup">
      <Header
        title="Moth Trap"
        rightSlot={getFinishButton()}
        // BackButton={CancelButtonWrap}
      />
      <Main
        location={location}
        addNewLamp={addNewLamp}
        deleteLamp={deleteLamp}
      />
    </Page>
  );
};

export default observer(MothTrapSetup);
