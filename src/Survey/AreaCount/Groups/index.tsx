import { useContext, useState } from 'react';
import { observer } from 'mobx-react';
import { NavContext } from '@ionic/react';
import {
  // device,
  Header,
  Page,
  useLoader,
  useToast,
} from 'common/flumens';
import appModel from 'common/models/app';
import groups from 'common/models/collections/groups';
import {
  fetch as fetchAllGroups,
  join,
  leave,
} from 'common/models/collections/groups/service';
import Group, { RemoteAttributes } from 'models/group';
import Sample from 'models/sample';
import { useUserStatusCheck } from 'models/user';
import Main from './Main';

const device = { isOnline: true }; // TODO:

type Props = {
  sample: Sample;
};

const Groups = ({ sample }: Props) => {
  const toast = useToast();
  const loader = useLoader();
  const checkUserStatus = useUserStatusCheck();
  const navigation = useContext(NavContext);

  // eslint-disable-next-line
  groups.length; // to force refresh when groups list is updated

  const setGroup = (value: any) => {
    const byId = (group: Group) => group.id === value;
    const group = groups.find(byId);
    if (!group) {
      // eslint-disable-next-line
      sample.attrs.group = undefined;
      // eslint-disable-next-line
      appModel.attrs.defaultGroup = undefined;
    } else {
      const simplifiedGroup = { title: group.attrs.title, id: group.id! };
      // eslint-disable-next-line
      sample.attrs.group = group ? simplifiedGroup : undefined;
      appModel.attrs.defaultGroup = simplifiedGroup;
    }

    navigation.goBack();
  };

  const [allGroups, setAllGroups] = useState<RemoteAttributes[]>([]);

  const joinGroup = async (doc: RemoteAttributes) => {
    console.log('Projects joining', doc.id);

    try {
      await loader.show('Please wait...');
      await join(doc);

      const allGroupsWithoutTheJoined = allGroups.filter(
        ({ id }: RemoteAttributes) => id !== doc.id
      );
      setAllGroups(allGroupsWithoutTheJoined);
      toast.success('Successfully joined the project.');
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();

    await groups.fetch();
  };

  const leaveGroup = async (groupId: string) => {
    console.log('Projects leaving', groupId);

    try {
      await loader.show('Please wait...');
      await leave(groupId);
      await groups.fetch();

      if (sample.attrs.group?.id === groupId) {
        // eslint-disable-next-line
        sample.attrs.group = undefined;
      }

      if (appModel.attrs.defaultGroup?.id === groupId) {
        appModel.attrs.defaultGroup = undefined;
      }

      toast.success('Successfully left the project.');
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  const refreshGroups = async (type: 'joined' | 'all') => {
    console.log('Groups refreshing', type);

    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    try {
      await loader.show('Please wait...');

      if (type === 'all') {
        const docs = await fetchAllGroups({});
        setAllGroups(docs);
      } else {
        await groups.fetch();
      }
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  return (
    <Page id="precise-area-count-edit-group">
      <Header title="Projects" />

      <Main
        sample={sample}
        setGroup={setGroup}
        onJoinGroup={joinGroup}
        onLeaveGroup={leaveGroup}
        allGroups={allGroups}
        onRefresh={refreshGroups}
      />
    </Page>
  );
};

export default observer(Groups);
