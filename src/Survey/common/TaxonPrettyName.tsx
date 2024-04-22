const TaxonPrettyName = ({ name }: { name: string | string[] }) => {
  if (!Array.isArray(name)) {
    return (
      <div className="overflow-hidden text-ellipsis pr-1 italic">{name}</div>
    );
  }

  const [commonName, scientificName] = name;

  return (
    <div className="flex flex-col gap-1">
      <div className="overflow-hidden text-ellipsis">{commonName}</div>
      <div className="overflow-hidden text-ellipsis pr-1 italic">
        {scientificName}
      </div>
    </div>
  );
};

export default TaxonPrettyName;
