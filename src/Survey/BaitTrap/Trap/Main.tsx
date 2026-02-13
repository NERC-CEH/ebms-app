import { useContext } from 'react';
import { observer } from 'mobx-react';
import { addCircleOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Main, MenuAttrItem, useAlert, Button } from '@flumens';
import {
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonList,
  NavContext,
} from '@ionic/react';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import { Data, fieldCodeAttr, OccData, SubSmpData } from '../config';

type Props = {
  sample: Sample<Data>;
  subSample: Sample<SubSmpData>;
};

const getSpeciesCode = (sample: Sample<Data>, occurrence: Occurrence) => {
  const fieldCode = sample.data[fieldCodeAttr.id] || '';

  // collect all occurrences across all sub-samples, flattened
  const allOccurrences = sample.samples.flatMap(smp => smp.occurrences);

  // find this occurrence's index (1-based)
  const index = allOccurrences.findIndex(occ => occ.cid === occurrence.cid) + 1;

  return `${fieldCode}${index}`;
};

const useDeleteSpecies = () => {
  const alert = useAlert();

  return (occ: Occurrence) => {
    alert({
      header: 'Delete',
      message: 'Are you sure you want to delete this species?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => occ.destroy(),
        },
      ],
    });
  };
};

const TrapHomeMain = ({ sample, subSample }: Props) => {
  const match = useRouteMatch();
  const { navigate } = useContext(NavContext);

  const onDeleteSpecies = useDeleteSpecies();

  const { url } = match;

  const { isDisabled } = subSample;

  const onAddSpecies = () => navigate(`${url}/taxon`);

  const getListItem = (occ: Occurrence<OccData>) => {
    const speciesCode = getSpeciesCode(sample, occ);
    const speciesName = occ.data.taxon?.scientificName || 'Unknown';

    return (
      <IonItemSliding key={occ.cid}>
        <IonItem
          routerLink={`${url}/occ/${occ.cid}`}
          detail
          disabled={isDisabled}
          className="[--padding-start:2px]"
        >
          <div className="w-full flex items-center">
            <div className="text-lg text-center font-light mr-2 w-14">
              {speciesCode}
            </div>
            <div className="">{speciesName}</div>
          </div>
        </IonItem>

        <IonItemOptions side="end">
          <IonItemOption color="danger" onClick={() => onDeleteSpecies(occ)}>
            <T>Delete</T>
          </IonItemOption>
        </IonItemOptions>
      </IonItemSliding>
    );
  };

  return (
    <Main className="ion-padding">
      <IonList lines="full">
        <div className="rounded-list">
          <MenuAttrItem
            routerLink={`${url}/details`}
            label="Trap details"
            disabled={isDisabled}
          />
        </div>
      </IonList>

      {!isDisabled && (
        <Button
          color="primary"
          className="mx-auto mt-10"
          onPress={onAddSpecies}
          prefix={<IonIcon src={addCircleOutline} className="size-5" />}
        >
          Add species
        </Button>
      )}

      {subSample.occurrences.length > 0 && (
        <IonList lines="full" className="mt-10!">
          <div className="rounded-list">
            <div className="list-divider gap-6">
              <div>
                <T>Code</T>
              </div>
              <div className="flex w-full">
                <T>Species</T>
              </div>
            </div>
            {subSample.occurrences.map(getListItem as any)}
          </div>
        </IonList>
      )}
    </Main>
  );
};

export default observer(TrapHomeMain);
