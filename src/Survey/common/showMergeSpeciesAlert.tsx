import { Trans as T } from 'react-i18next';
import { useAlert } from '@flumens';

export default async (alert: ReturnType<typeof useAlert>) => {
  const showMergeSpeciesDialog = (resolve: (merge: boolean) => void) => {
    alert({
      header: 'survey.speciesAlreadyExists',
      message: <T>survey.confirmMergeList</T>,
      backdropDismiss: false,
      buttons: [
        {
          text: 'common.cancel',
          handler: () => {
            resolve(false);
          },
        },
        {
          text: 'survey.merge',
          cssClass: 'primary',
          handler: () => {
            resolve(true);
          },
        },
      ],
    });
  };
  return new Promise<boolean>(showMergeSpeciesDialog);
};
