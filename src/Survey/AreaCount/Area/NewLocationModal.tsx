import { useRef, useState } from 'react';
import { Redirect, Route } from 'react-router';
import { ModalHeader, Page, Main, Header } from '@flumens';
import { dismiss } from '@ionic/core/dist/types/utils/overlays';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonModal,
  IonNav,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

type Props = { presentingElement: any; isOpen: any; onClose?: any };

const Location = ({ onClose }: any) => (
  <Page id="new-location">
    <IonHeader>
      <IonToolbar>
        <IonTitle>Modal</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={onClose}>Close</IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
    <Main>content</Main>
  </Page>
);

const NewLocationModal = ({ presentingElement, isOpen, onClose }: Props) => {
  console.log('isOpen', isOpen);

  const modal = useRef<HTMLIonModalElement>(null);

  const onCloseWrap = () => {
    modal.current?.dismiss();
    // console.log(modal.current);
    console.log('closing');

    onClose();
  };

  return (
    <IonModal
      ref={modal}
      // isOpen={isOpen}
      backdropDismiss={false}
      // initialBreakpoint={0.25}
      // breakpoints={[0, 0.25, 0.5, 0.75]}
      // presentingElement={presentingElement}
      canDismiss={false}
      trigger="open-modal"
    >
      <IonNav root={() => <Location onClose={onCloseWrap} />}></IonNav>
    </IonModal>
  );
};

export default NewLocationModal;
