import { observer } from 'mobx-react';
import { bulbOutline, chatboxOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Main, MenuAttrItem, NumberInput } from '@flumens';
import { IonList, IonIcon } from '@ionic/react';
import numberIcon from 'common/images/number.svg';
import Location, { Lamp } from 'models/location';
import './styles.scss';

type Props = {
  location: Location;
  lamp: Lamp;
};

const MothTrapSetupMain = ({ location, lamp }: Props) => {
  const { description, type } = lamp.attrs;

  const getCounterOnChange = (value: number) => {
    // eslint-disable-next-line no-param-reassign
    lamp.attrs.quantity = value;
  };

  return (
    <Main>
      <IonList lines="full">
        <h3 className="list-title">
          <T>Lamp Details</T>
        </h3>

        <div className="rounded-list">
          <MenuAttrItem
            routerLink={`/location/${location.cid}/lamps/${lamp.cid}/type`}
            routerOptions={{ unmount: true }}
            icon={bulbOutline}
            label="Type"
            value={type}
          />

          <MenuAttrItem
            routerLink={`/location/${location.cid}/lamps/${lamp.cid}/description`}
            routerOptions={{ unmount: true }}
            icon={chatboxOutline}
            label="Description"
            value={description}
          />

          <NumberInput
            label="Quantity"
            onChange={getCounterOnChange}
            value={lamp.attrs.quantity}
            prefix={<IonIcon src={numberIcon} className="size-6" />}
            minValue={1}
          />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(MothTrapSetupMain);
