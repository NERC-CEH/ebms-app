import { Trans as T } from 'react-i18next';

export default async (alert: any) => {
  const showMergeSpeciesDialog = (resolve: any) => {
    alert({
      header: 'Species already exists',
      message: (
        <T>
          Are you sure you want to merge this list to the existing species list?
        </T>
      ),
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            resolve(false);
          },
        },
        {
          text: 'Merge',
          cssClass: 'primary',
          handler: () => {
            resolve(true);
          },
        },
      ],
    });
  };
  return new Promise(showMergeSpeciesDialog);
};
