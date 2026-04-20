import { useContext } from 'react';
import { observer } from 'mobx-react';
import { addCircleOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import {
  Main,
  MenuAttrItem,
  useAlert,
  Button,
  InfoBackgroundMessage,
} from '@flumens';
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
import TaxonPrettyName from 'Survey/common/TaxonPrettyName';
import { fieldCodeAttr, OccData, SubSmpData } from '../../config';

type Props = {
  subSample: Sample<SubSmpData>;
};

const useDeleteSpecies = () => {
  const alert = useAlert();

  return (occ: Occurrence) => {
    alert({
      header: 'Delete',
      message: 'Are you sure you want to remove this entry?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => occ.destroy() },
      ],
    });
  };
};

const TrapHomeMain = ({ subSample }: Props) => {
  const match = useRouteMatch();
  const { navigate } = useContext(NavContext);

  const onDeleteSpecies = useDeleteSpecies();

  const { url } = match;

  const { isDisabled } = subSample;

  const onAddSpecies = () => navigate(`${url}/taxon`);

  const getListItem = (occ: Occurrence<OccData>) => {
    const speciesCode = occ.data[fieldCodeAttr.id];

    return (
      <IonItemSliding key={occ.cid}>
        <IonItem
          routerLink={`${url}/occ/${occ.cid}`}
          className="[--padding-start:2px]"
        >
          <div className="w-full flex items-center py-1">
            <div className="text-lg text-center font-light mr-2 w-14">
              {speciesCode}
            </div>
            <TaxonPrettyName {...occ.data.taxon} />
          </div>
        </IonItem>

        {!isDisabled && (
          <IonItemOptions side="end">
            <IonItemOption color="danger" onClick={() => onDeleteSpecies(occ)}>
              <T>Delete</T>
            </IonItemOption>
          </IonItemOptions>
        )}
      </IonItemSliding>
    );
  };

  return (
    <Main className="[--padding-bottom:40px]">
      <IonList lines="full">
        <div className="rounded-list">
          <MenuAttrItem routerLink={`${url}/details`} label="Trap details" />
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

      {subSample.occurrences.length > 0 ? (
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
      ) : (
        <InfoBackgroundMessage>No species added</InfoBackgroundMessage>
      )}
    </Main>
  );
};

export default observer(TrapHomeMain);
