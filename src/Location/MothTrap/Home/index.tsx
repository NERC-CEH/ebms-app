/* eslint-disable no-param-reassign */

/* eslint-disable camelcase */
import { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Page, Header, useAlert, useToast, UUID } from '@flumens';
import { NavContext } from '@ionic/react';
import Location, { Lamp, useValidateCheck } from 'models/location';
import { useUserStatusCheck } from 'models/user';
import HeaderButton from 'Survey/common/HeaderButton';
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
