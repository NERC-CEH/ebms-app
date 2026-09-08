import { ReactNode, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Gallery } from '@flumens';
import Media from 'models/media';
import { ClassifierSuggestion } from 'models/occurrence';
import ImageFooter from './ImageFooter';

type Props = {
  items: Media[];
  showGallery: number;
  onClose: () => boolean;
  onDelete: (media: Media) => void;
  onIdentify: (manualTrigger?: boolean) => void;
  onSpeciesSelect: (suggestion: ClassifierSuggestion) => void;
  isDisabled: boolean;
};

const Footer = ({ children }: { children: ReactNode }) => (
  <div className="fixed bottom-0 w-full pb-6.5">{children}</div>
);

const GalleryComponent = ({
  items,
  showGallery,
  onClose,
  onDelete,
  onSpeciesSelect,
  onIdentify,
  isDisabled,
}: Props) => {
  const getItem = (image: Media) => {
    const onSpeciesSelectWrap = (suggestion: ClassifierSuggestion) => {
      if (isDisabled) return;

      onSpeciesSelect(suggestion);
      onClose();
    };

    return {
      src: image.getURL(),
      footer: (
        <ImageFooter
          image={image}
          identifySpecies={onIdentify}
          onDelete={onDelete}
          onSpeciesSelect={onSpeciesSelectWrap}
        />
      ),
    };
  };

  const closeGalleryIfDeletedLastPhoto = () => {
    if (Number.isFinite(showGallery) && !items.length) onClose();
  };
  useEffect(closeGalleryIfDeletedLastPhoto, [items.length]);

  return (
    <Gallery
      isOpen={Number.isFinite(showGallery)}
      items={items.map(getItem)}
      initialSlide={showGallery}
      onClose={onClose}
      Footer={Footer}
    />
  );
};

export default observer(GalleryComponent);
