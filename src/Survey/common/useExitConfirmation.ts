import { useContext } from 'react';
import { useAlert, useOnBackButton } from '@flumens';
import { NavContext } from '@ionic/react';

type SampleLike = {
  isDisabled?: boolean;
  metadata: { saved?: unknown; completedDetails?: unknown };
};

// prompts the user to confirm leaving an in-progress survey
const useExitConfirmation = () => {
  const alert = useAlert();

  return () =>
    new Promise<boolean>(resolve => {
      alert({
        header: 'Exit Survey',
        backdropDismiss: false,
        message:
          'Are you sure you want to leave? Your survey will be saved as a draft.',
        buttons: [
          { text: 'Cancel', handler: () => resolve(false) },
          { text: 'Exit', handler: () => resolve(true) },
        ],
      });
    });
};

// const OVERLAY_PRIORITY = 100; // modals alerts etc
// const LOW_PRIORITY_OVERLAY = 10; // should be less than 100

// export const useOnBackButton2 = (
//   onBackButton: (processNextHandler: () => void) => void
// ) => {
//   // track whether this page's view is currently active
//   const isActiveRef = useRef(true);
//   useIonViewWillEnter(() => {
//     isActiveRef.current = true;
//   });

//   useIonViewWillLeave(() => {
//     isActiveRef.current = false;
//   });

//   const disableBackButton = () => {
//     const disableHardwareBackButton = (event: any) => {
//       console.log('🍄 ionBackButton event', event);

//       // skip if this page is not the active view
//       if (!isActiveRef.current) return;

//       event.stopImmediatePropagation();
//       event.stopPropagation();
//       event.preventDefault();
//       event.detail.register(OVERLAY_PRIORITY, (processNextHandler: any) => {
//         processNextHandler();
//         event.stopImmediatePropagation();
//         event.stopPropagation();
//         event.preventDefault();
//       });

//       event.detail.register(LOW_PRIORITY_OVERLAY, onBackButton);
//     };

//     document.addEventListener('ionBackButton', disableHardwareBackButton);

//     const removeEventListener = () =>
//       document.removeEventListener('ionBackButton', disableHardwareBackButton);
//     return removeEventListener;
//   };

//   useEffect(disableBackButton, [onBackButton]);
// };

// onExit handler for survey home pages - guards unsaved (draft) surveys
export const useOnExit = (sample: SampleLike | null | undefined) => {
  const { goBack } = useContext(NavContext);
  const confirmExit = useExitConfirmation();

  const onExit = async (setIsLeaving?: (value: boolean) => void) => {
    if (!sample?.metadata.saved && !sample?.isDisabled) {
      const shouldExit = await confirmExit();
      if (!shouldExit) {
        setIsLeaving?.(false);
        return;
      }
    }

    goBack();
  };

  useOnBackButton(onExit);

  return onExit;
};

// onExit handler for survey details pages - guards incomplete details
export const useOnExitDetails = (sample: SampleLike | null | undefined) => {
  const { goBack } = useContext(NavContext);
  const confirmExit = useExitConfirmation();

  const onExit = async (setIsLeaving?: (value: boolean) => void) => {
    if (!sample?.metadata.completedDetails && !sample?.isDisabled) {
      const shouldExit = await confirmExit();

      if (!shouldExit) {
        setIsLeaving?.(false);
        return;
      }
    }

    goBack();
  };

  useOnBackButton(onExit);

  return onExit;
};

export default useExitConfirmation;
