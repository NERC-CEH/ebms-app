/* eslint-disable @getify/proper-arrows/name */
import { FC } from 'react';
import { Gallery, useOnHideModal } from '@flumens';
import { Species } from 'common/data/profiles';
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

  const getImageSource = (_: any, index: number) => {
    if (!species?.image_copyright) return null;
    return {
      src: `/images/${species.id}_${index}_image.jpg`,
      footer: `© ${species.image_copyright[index]}`,
    };
  };

  if (!species?.image_copyright?.length) return null;

  const items = species?.image_copyright.map(getImageSource);

  return (
    <Gallery isOpen={showGallery} items={items} onClose={onClose} mode="md" />
  );
};

export default FullScreenPhotoViewer;
