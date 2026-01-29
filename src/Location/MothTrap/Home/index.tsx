import { useContext } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Page, Header, useAlert, useToast, UUIDv7 } from '@flumens';
import { NavContext } from '@ionic/react';
import {
  Lamp,
  mothTrapLampDescriptionAttr,
  mothTrapLampQuantityAttr,
  mothTrapLampTypeAttr,
  mothTrapLampTypeNameAttr,
  mothTrapLampsAttr,
  useValidateCheck,
} from 'models/location';
import { useUserStatusCheck } from 'models/user';
import HeaderButton from 'Survey/common/HeaderButton';
import useLocation from '../useLocation';
import Main from './Main';

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

const MothTrapSetup = () => {
  const { location } = useLocation();
  if (!location) throw new Error('No location was found');

  const checkUserStatus = useUserStatusCheck();

  const { navigate, goBack } = useContext(NavContext);
  const validateLocation = useValidateCheck();
  const { url } = useRouteMatch();
  const toast = useToast();
  const showDeleteLampPrompt = useDeleteLampPrompt();

  const deleteLamp = async (entry: Lamp) => {
    const byLamp = (lamp: Lamp) => lamp.cid === entry.cid;
    const lampIndex = location.data[mothTrapLampsAttr.id].findIndex(byLamp);

    const change = await showDeleteLampPrompt();
    if (change) {
      location.data[mothTrapLampsAttr.id].splice(lampIndex, 1); // 2nd parameter means remove one item only
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
    const cid = UUIDv7();

    if (!location.data[mothTrapLampsAttr.id]) {
      location.data[mothTrapLampsAttr.id] = [];
    }

    location.data[mothTrapLampsAttr.id].push({
      cid,
      data: {
        [mothTrapLampTypeNameAttr.id]: '',
        [mothTrapLampTypeAttr.id]: '',
        [mothTrapLampQuantityAttr.id]: 1,
        [mothTrapLampDescriptionAttr.id]: '',
      },
    });
    location.save();

    navigate(`${url}/lamps/${cid}`);
  };

  const { saved } = location.metadata;

  const getFinishButton = () => {
    const isInvalid = !!location.validateRemote();

    return (
      <HeaderButton isInvalid={isInvalid} onClick={onSubmit}>
        {!saved ? 'Save' : 'Upload'}
      </HeaderButton>
    );
  };

  return (
    <Page id="moth-trap-setup">
      <Header title="Moth Trap" rightSlot={getFinishButton()} />
      <Main
        location={location}
        addNewLamp={addNewLamp}
        deleteLamp={deleteLamp}
      />
    </Page>
  );
};

export default observer(MothTrapSetup);
