/* eslint-disable @getify/proper-arrows/name */
import { FC } from 'react';
import { Species } from 'common/data/profiles';
import { Gallery, useOnHideModal } from '@flumens';
import '../styles.scss';

type Props = {
  species: Species;
  onClose: () => void;
  showGallery: boolean;
};

const FullScreenPhotoViewer: FC<Props> = ({
  species,
  onClose,
  showGallery,
}) => {
  useOnHideModal(onClose);

  const items = [
    {
      src: `/images/${species.image}_image.jpg`,
      footer: `© ${species.image_copyright}`,
    },
  ];

  return (
    <Gallery isOpen={showGallery} items={items} onClose={onClose} mode="md" />
  );
};

export default FullScreenPhotoViewer;
