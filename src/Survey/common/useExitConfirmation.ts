import { useContext } from 'react';
import { useAlert, useOnBackButton } from '@flumens';
import { NavContext } from '@ionic/react';

type SampleLike = {
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

// onExit handler for survey home pages - guards unsaved (draft) surveys
export const useOnExit = (sample: SampleLike | null | undefined) => {
  const { goBack } = useContext(NavContext);
  const confirmExit = useExitConfirmation();

  const onExit = async (setIsLeaving?: (value: boolean) => void) => {
    if (!sample?.metadata.saved) {
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
    if (!sample?.metadata.completedDetails) {
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
