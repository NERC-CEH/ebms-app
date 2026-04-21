import { observer } from 'mobx-react';
import { trashBinOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { Button, usePhotoDeletePrompt } from 'common/flumens';
import Occurrence from 'common/models/occurrence';
import Media from 'models/media';
import SpeciesSuggestions from './SpeciesSuggestions';

type Props = {
  onDelete: any;
  image: Media;
  identifySpecies?: any;
  onSpeciesSelect: any;
};

const ImageFooter = ({
  onDelete,
  image,
  identifySpecies,
  onSpeciesSelect,
}: Props) => {
  const showDeletePrompt = usePhotoDeletePrompt();

  const onDeleteWrap = async () => {
    const shouldDelete = await showDeletePrompt();
    if (!shouldDelete) return;
    onDelete(image);
  };

  const occurrence = image.parent instanceof Occurrence ? image.parent : null;

  const allowToEdit = !image.parent?.isDisabled && !image?.isIdentifying;

  return (
    <div className="mx-4 flex justify-between gap-2">
      {occurrence && !occurrence.isDisabled && (
        <SpeciesSuggestions
          occurrence={occurrence as any}
          identifySpecies={identifySpecies}
          onSpeciesSelect={onSpeciesSelect}
          media={image}
        />
      )}

      {allowToEdit && (
        <div className="flex gap-4">
          <Button
            className="shrink-0 bg-black/60 p-2 text-white data-[pressed=true]:bg-neutral-100/40"
            onPress={onDeleteWrap}
            fill="clear"
            shape="round"
          >
            <IonIcon
              icon={trashBinOutline}
              className="size-8 [--ionicon-stroke-width:20px]"
            />
          </Button>
        </div>
      )}
    </div>
  );
};

export default observer(ImageFooter);
