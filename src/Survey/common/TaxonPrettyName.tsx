import { observer } from 'mobx-react';
import clsx from 'clsx';
import appModel from 'models/app';

type Props = {
  commonName?: string;
  scientificName: string;
  className?: string;
};

const TaxonPrettyName = ({ commonName, scientificName, className }: Props) => {
  const { taxonNameDisplay } = appModel.data;

  // show scientific only
  if (taxonNameDisplay === 'scientificOnly') {
    return (
      <div className={clsx('pr-1 italic line-clamp-1 w-full', className)}>
        {scientificName}
      </div>
    );
  }

  // show common only
  if (taxonNameDisplay === 'commonOnly' && commonName) {
    return (
      <div
        className={clsx('font-semibold pr-1 line-clamp-1 w-full', className)}
      >
        {commonName}
      </div>
    );
  }

  // show both (default: 'commonScientific')
  if (!commonName) {
    return (
      <div className={clsx('pr-1 italic line-clamp-1 w-full', className)}>
        {scientificName}
      </div>
    );
  }

  return (
    <div className={clsx('flex flex-col w-full overflow-hidden', className)}>
      <div className="font-semibold truncate">{commonName}</div>
      <div className="pr-1 italic truncate">{scientificName}</div>
    </div>
  );
};

export default observer(TaxonPrettyName);
