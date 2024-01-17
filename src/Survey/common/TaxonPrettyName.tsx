import { IonLabel } from '@ionic/react';

const TaxonPrettyName = ({ name }: { name: string | string[] }) => {
  if (!Array.isArray(name)) {
    return (
      <IonLabel mode="ios" className="pr-1">
        <i>{name}</i>
      </IonLabel>
    );
  }

  const [commonName, scientificName] = name;

  return (
    <IonLabel position="stacked" mode="ios">
      <IonLabel className="overflow-hidden text-ellipsis">
        {commonName}
      </IonLabel>
      <IonLabel className="overflow-hidden text-ellipsis pr-1">
        <i>{scientificName}</i>
      </IonLabel>
    </IonLabel>
  );
};

export default TaxonPrettyName;
