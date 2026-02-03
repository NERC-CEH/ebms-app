import { Taxon } from 'common/models/occurrence';

type Props = {
  taxon: Taxon;
};

const TaxonPrettyName = ({ taxon }: Props) => {
  if (!taxon.commonName) {
    return (
      <div className="overflow-hidden text-ellipsis pr-1 italic">
        {taxon.scientificName}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="overflow-hidden text-ellipsis font-semibold">
        {taxon.commonName}
      </div>
      <div className="overflow-hidden text-ellipsis pr-1 italic">
        {taxon.scientificName}
      </div>
    </div>
  );
};

export default TaxonPrettyName;
