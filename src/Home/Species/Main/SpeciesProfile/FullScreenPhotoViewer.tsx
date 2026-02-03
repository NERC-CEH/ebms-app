import { Gallery, useOnHideModal } from '@flumens';
import { Species } from 'common/data/profiles';
import '../styles.scss';

type Props = {
  species: Species;
  onClose: () => void;
  showGallery: boolean;
};

const FullScreenPhotoViewer = ({ species, onClose, showGallery }: Props) => {
  useOnHideModal(onClose);

  const getImageSource = (_: any, index: number) => {
    if (!species?.imageCopyright) return null;
    return {
      src: `/images/${species.id}_${index}_image.jpg`,
      footer: `© ${species.imageCopyright[index]}`,
    };
  };

  if (!species?.imageCopyright?.length) return null;

  const items = species?.imageCopyright.map(getImageSource);

  return (
    <Gallery isOpen={showGallery} items={items} onClose={onClose} mode="md" />
  );
};

export default FullScreenPhotoViewer;
