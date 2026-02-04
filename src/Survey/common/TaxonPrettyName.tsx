import { observer } from 'mobx-react';
import clsx from 'clsx';
import { Taxon } from 'common/models/occurrence';
import appModel from 'models/app';

type Props = {
  taxon: Taxon;
  className?: string;
};

const TaxonPrettyName = ({ taxon, className }: Props) => {
  const { taxonNameDisplay } = appModel.data;

  // show scientific only
  if (taxonNameDisplay === 'scientificOnly') {
    return (
      <div className={clsx('pr-1 italic line-clamp-1 w-full', className)}>
        {taxon.scientificName}
      </div>
    );
  }

  // show common only
  if (taxonNameDisplay === 'commonOnly' && taxon.commonName) {
    return (
      <div
        className={clsx('font-semibold pr-1 line-clamp-1 w-full', className)}
      >
        {taxon.commonName}
      </div>
    );
  }

  // show both (default: 'commonScientific')
  if (!taxon.commonName) {
    return (
      <div className={clsx('pr-1 italic line-clamp-1 w-full', className)}>
        {taxon.scientificName}
      </div>
    );
  }

  return (
    <div className={clsx('flex flex-col w-full', className)}>
      <div className="font-semibold truncate">{taxon.commonName}</div>
      <div className="pr-1 italic truncate">{taxon.scientificName}</div>
    </div>
  );
};

export default observer(TaxonPrettyName);
