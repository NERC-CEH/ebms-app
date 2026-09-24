import { useContext } from 'react';
import { useAlert, useOnBackButton } from '@flumens';
import { NavContext } from '@ionic/react';

type SampleLike = {
  isDisabled?: boolean;
  metadata: { saved?: boolean; completedDetails?: boolean };
};

// prompts the user to confirm leaving an in-progress survey
const useExitConfirmation = () => {
  const alert = useAlert();

  return () =>
    new Promise<boolean>(resolve => {
      alert({
        header: 'survey.exitSurvey',
        backdropDismiss: false,
        message: 'survey.confirmLeaveSurvey',
        buttons: [
          { text: 'common.cancel', handler: () => resolve(false) },
          { text: 'survey.exit', handler: () => resolve(true) },
        ],
      });
    });
};

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
