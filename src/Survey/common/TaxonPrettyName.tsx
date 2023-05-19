import { IonLabel } from '@ionic/react';

const extraPadding = { paddingRight: '1px' };

const TaxonPrettyName = ({ name }: { name: string | string[] }) => {
  if (!Array.isArray(name)) {
    return (
      <IonLabel mode="ios" style={extraPadding}>
        <i>{name}</i>
      </IonLabel>
    );
  }

  const [commonName, scientificName] = name;

  return (
    <IonLabel position="stacked" mode="ios">
      <IonLabel>{commonName}</IonLabel>
      <IonLabel style={extraPadding}>
        <i>{scientificName}</i>
      </IonLabel>
    </IonLabel>
  );
};

export default TaxonPrettyName;
