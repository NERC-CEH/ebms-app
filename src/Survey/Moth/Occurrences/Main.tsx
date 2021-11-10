import React, { FC, useContext } from 'react';
import Sample from 'models/sample';
import {
  Main,
  MenuAttrItem,
  InfoBackgroundMessage as InfoMessage,
} from '@apps';
import {
  IonList,
  IonIcon,
  IonAvatar,
  IonLabel,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonItemDivider,
  NavContext,
} from '@ionic/react';
import { Trans as T } from 'react-i18next';
import Occurrence from 'models/occurrence';
import { observer } from 'mobx-react';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import mothIcon from 'common/images/moth.svg';
import './styles.scss';

interface Props {
  match: any;
  sample: typeof Sample;
  deleteSpecies: any;
}

function getSpeciesInfo(occurrence: any) {
  const image = occurrence.media[0];
  let avatar = <IonIcon icon={mothIcon} />;

  if (image) {
    avatar = <img src={image.getURL()} />;
  }

  const timestamp = new Date(occurrence.metadata.created_on).toISOString();
  const hours = new Date(timestamp).getHours();
  const minutes = new Date(timestamp).getMinutes();
  const minutesWithZero = minutes < 10 ? `0${minutes}` : minutes;
  const time = `${hours}:${minutesWithZero}`;

  const comment = occurrence.attrs.comment || null;

  return (
    <>
      <IonAvatar>{avatar}</IonAvatar>

      <IonLabel position="stacked" mode="ios" color="dark" className="label">
        <IonLabel className="timestamp">
          <b>{time}</b>
        </IonLabel>
        {comment && <IonLabel className="comment">{comment}</IonLabel>}
      </IonLabel>
    </>
  );
}

const OccurrencesMain: FC<Props> = ({ sample, match, deleteSpecies }) => {
  const { navigate } = useContext(NavContext);
  const { taxa } = match.params;
  const isDisabled = sample.isDisabled();

  const urlHome = `/survey/moth/${sample.cid}`;

  const selectedTaxon = (occurrence: typeof Occurrence) => {
    return occurrence.attrs.taxon.warehouse_id === parseInt(taxa, 10);
  };

  const species = sample.occurrences.filter(selectedTaxon);

  const getSpeciesList = () => {
    const getSpeciesEntry = (occurrence: typeof Sample) => {
      const deleteSpeciesWrap = () => {
        deleteSpecies(occurrence);

        if (!species.length) {
          navigate(urlHome);
        }

        return null;
      };

      const url = `/survey/moth/${sample.cid}/occurrences/occ/${occurrence.cid}`;

      return (
        <div className="rounded" key={occurrence.cid}>
          <IonItemSliding className="species">
            <IonItem routerLink={url} detail>
              {getSpeciesInfo(occurrence)}
            </IonItem>

            {!isDisabled && (
              <IonItemOptions side="end" onClick={deleteSpeciesWrap}>
                <IonItemOption color="danger">Delete</IonItemOption>
              </IonItemOptions>
            )}
          </IonItemSliding>
        </div>
      );
    };

    const speciesList = species.map(getSpeciesEntry);

    return (
      <>
        <IonItemDivider>
          <T>Species list</T>
        </IonItemDivider>
        {speciesList}

        <InfoBackgroundMessage name="showSurveysDeleteTip">
          To delete any species swipe it to the left.
        </InfoBackgroundMessage>
      </>
    );
  };

  if (!species.length) {
    return (
      <Main id="area-count-occurrence-edit">
        <IonList id="list" lines="full">
          <InfoMessage>No species added</InfoMessage>
        </IonList>
      </Main>
    );
  }

  return (
    <Main>
      <IonList lines="full">
        <div className="rounded">
          <MenuAttrItem
            routerLink={`${match.url}/taxon`}
            icon={mothIcon}
            label="Species"
            value={species[0].getTaxonName()}
          />
        </div>

        {getSpeciesList()}
      </IonList>
    </Main>
  );
};

export default observer(OccurrencesMain);
