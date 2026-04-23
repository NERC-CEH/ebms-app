import { useContext, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import NewMothTrapModal from 'Location/MothTrap/New';
import {
  mothTrapLampsAttr,
  mothTrapOtherTypeAttr,
  mothTrapTypeAttr,
} from 'Location/MothTrap/New/config';
import { useRouteMatch } from 'react-router';
import { Header, useSample, useRemoteSample } from '@flumens';
import { IonPage, NavContext } from '@ionic/react';
import groups from 'common/models/collections/groups';
import userModel from 'common/models/user';
import type { Data as LocationData } from 'models/location';
import Sample, { useValidateCheck } from 'models/sample';
import HeaderButton from 'Survey/common/HeaderButton';
import { useOnExitDetails } from 'Survey/common/useExitConfirmation';
import {
  tempMothTrapTypeAttr,
  tempMothTrapOtherTypeAttr,
  tempMothTrapLampsAttr,
  useTemporarySiteAttr,
} from '../config';
import Main from './Main';
import './styles.scss';

const mapAttr2Attr = (fromAttr: any, toAttr: any, val?: string): string => {
  if (!val) return '';

  const origChoice = fromAttr.choices.find((c: any) => c.dataName === val);
  if (!origChoice) return ''; // edge case: stale or unexpected value not present in choices

  const choice = toAttr.choices.find((c: any) => c.title === origChoice.title);

  return choice?.dataName || '';
};

const DetailsController = () => {
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();

  let { sample } = useSample<Sample>();
  sample = useRemoteSample(sample, () => userModel.isLoggedIn(), Sample);

  const checkSampleStatus = useValidateCheck(sample);

  const onExit = useOnExitDetails(sample);

  const pageRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLIonModalElement>(null);
  const [presentingElement, setPresentingElement] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    setPresentingElement(pageRef.current);
  }, []);

  if (!sample) return null;

  const openTemporaryTrapModal = () => {
    modalRef.current?.present();
  };

  const saveTemporaryTrap = async (trap: Partial<LocationData>) => {
    sample.data.locationName = trap.name;
    sample.data.enteredSref = trap.centroidSref;
    sample.data.enteredSrefSystem = trap.centroidSrefSystem as any;

    sample.data[tempMothTrapTypeAttr.id] = mapAttr2Attr(
      mothTrapTypeAttr,
      tempMothTrapTypeAttr,
      trap[mothTrapTypeAttr.id]
    );
    sample.data[tempMothTrapOtherTypeAttr.id] = trap[mothTrapOtherTypeAttr.id];
    sample.data[tempMothTrapLampsAttr.id] = trap[mothTrapLampsAttr.id]?.map(t =>
      JSON.stringify(t)
    );

    return true;
  };

  const onChangeSiteType = (value: boolean) => {
    sample.metadata[useTemporarySiteAttr.id] = value;

    delete sample.data.locationId;

    delete sample.data.locationName;
    delete sample.data.enteredSref;
    delete sample.data[tempMothTrapTypeAttr.id];
    delete sample.data[tempMothTrapOtherTypeAttr.id];
    delete sample.data[tempMothTrapLampsAttr.id];
  };

  const onFinish = () => {
    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.metadata.completedDetails = true;
    sample.save();

    const url = match.url.replace('/details', '');

    navigate(url, 'forward', 'pop');
  };

  const isInvalid = sample.validateRemote();

  const getNextButton = sample.isDetailsComplete() ? null : (
    <HeaderButton onClick={onFinish} isInvalid={isInvalid}>
      Next
    </HeaderButton>
  );

  const group = groups.idMap.get(sample.data.groupId!);

  return (
    <IonPage id="survey-moth-detail" ref={pageRef}>
      <Header
        title="Survey Details"
        rightSlot={getNextButton}
        onLeave={onExit}
      />

      <Main
        sample={sample}
        group={group}
        onOpenTemporaryTrapModal={openTemporaryTrapModal}
        onChangeSiteType={onChangeSiteType}
      />

      <NewMothTrapModal
        ref={modalRef}
        presentingElement={presentingElement}
        initialRecord={{
          name: sample.data.locationName,
          centroidSref: sample.data.enteredSref,
          [mothTrapTypeAttr.id]: mapAttr2Attr(
            tempMothTrapTypeAttr,
            mothTrapTypeAttr,
            sample.data[tempMothTrapTypeAttr.id]
          ),
          [mothTrapOtherTypeAttr.id]: sample.data[tempMothTrapOtherTypeAttr.id],
          [mothTrapLampsAttr.id]: sample.data[tempMothTrapLampsAttr.id]?.map(
            t => JSON.parse(t || '')
          ),
        }}
        onSave={saveTemporaryTrap}
      />
    </IonPage>
  );
};

export default observer(DetailsController);
