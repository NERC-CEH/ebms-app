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
import { fieldCodeAttr, SubSmpData } from '../../config';

type Props = {
  subSample: Sample<SubSmpData>;
};

const useDeleteSpecies = () => {
  const alert = useAlert();

  return (occ: Occurrence) => {
    alert({
      header: 'common.delete',
      message: 'bait.confirmRemoveEntry',
      buttons: [
        { text: 'common.cancel', role: 'cancel' },
        {
          text: 'common.delete',
          role: 'destructive',
          handler: () => occ.destroy(),
        },
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

  const getListItem = (occ: Occurrence) => {
    const speciesCode = occ.data[fieldCodeAttr.id] as string;

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
              <T>common.delete</T>
            </IonItemOption>
          </IonItemOptions>
        )}
      </IonItemSliding>
    );
  };

  return (
    <Main className="pb-ion-s-10">
      <IonList lines="full">
        <div className="rounded-list">
          <MenuAttrItem
            routerLink={`${url}/details`}
            label="bait.trapDetails"
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
          common.addSpecies
        </Button>
      )}

      {subSample.occurrences.length > 0 ? (
        <IonList lines="full" className="mt-10!">
          <div className="rounded-list">
            <div className="list-divider gap-6">
              <div>
                <T>bait.code</T>
              </div>
              <div className="flex w-full">
                <T>common.species</T>
              </div>
            </div>
            {subSample.occurrences.map(getListItem)}
          </div>
        </IonList>
      ) : (
        <InfoBackgroundMessage>common.noSpeciesAdded</InfoBackgroundMessage>
      )}
    </Main>
  );
};

export default observer(TrapHomeMain);
