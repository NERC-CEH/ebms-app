import { useContext } from 'react';
import { observer } from 'mobx-react';
import { NavContext } from '@ionic/react';
import {
  Header,
  Page,
  byGroupMembershipStatus,
  device,
  useLoader,
  useSample,
  useToast,
} from 'common/flumens';
import appModel from 'common/models/app';
import groups from 'common/models/collections/groups';
import Group from 'models/group';
import Sample from 'models/sample';
import { useUserStatusCheck } from 'models/user';
import Main from './Main';

const Groups = () => {
  const toast = useToast();
  const loader = useLoader();
  const checkUserStatus = useUserStatusCheck();
  const navigation = useContext(NavContext);

  const { sample } = useSample<Sample>();
  if (!sample) throw new Error('Sample is missing');

  // eslint-disable-next-line
  groups.length; // to force refresh when groups list is updated

  const onSelect = (groupId: any) => {
    const byId = (group: Group) => group.id === groupId;
    const group = groups.find(byId);
    if (!group) {
      sample.data.group = undefined;

      appModel.data.defaultGroup = undefined;
    } else {
      const simplifiedGroup = { title: group.data.title, id: group.id! };

      sample.data.group = group ? simplifiedGroup : undefined;
      appModel.data.defaultGroup = simplifiedGroup;
    }

    navigation.goBack();
  };

  const joinGroup = async (group: Group) => {
    console.log('Projects joining', group.id);

    try {
      await loader.show('Please wait...');
      await group.join();
      await groups.fetchRemote({ type: 'member' });
      await groups.fetchRemote({ type: 'joinable' });

      toast.success('Successfully joined the project.');
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  const leaveGroup = async (group: Group) => {
    console.log('Projects leaving', group.id);

    try {
      await loader.show('Please wait...');
      await group.leave();
      await groups.fetchRemote({ type: 'member' });
      await groups.fetchRemote({ type: 'joinable' });

      if (sample.data.group?.id === group.id) {
        sample.data.group = undefined;
      }

      if (appModel.data.defaultGroup?.id === group.id) {
        appModel.data.defaultGroup = undefined;
      }

      toast.success('Successfully left the project.');
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  const refreshGroups = async (type: 'member' | 'joinable') => {
    console.log('Groups refreshing', type);

    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    await loader.show('Please wait...');

    try {
      await groups.fetchRemote({ type });
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  const byTitle = (group1: Group, group2: Group) =>
    group1.data.title?.localeCompare(group2.data.title);

  const memberGroups = groups
    .filter(byGroupMembershipStatus('member'))
    .sort(byTitle);
  const joinableGroups = groups
    .filter(byGroupMembershipStatus('joinable'))
    .sort(byTitle);

  return (
    <Page id="precise-area-count-edit-group">
      <Header title="Projects" />

      <Main
        sample={sample}
        memberGroups={memberGroups}
        joinableGroups={joinableGroups}
        setGroup={onSelect}
        onJoinGroup={joinGroup}
        onLeaveGroup={leaveGroup}
        onRefresh={refreshGroups}
      />
    </Page>
  );
};

export default observer(Groups);
