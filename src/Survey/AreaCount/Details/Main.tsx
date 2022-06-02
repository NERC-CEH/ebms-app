import { FC } from 'react';
import { observer } from 'mobx-react';
import { IonList, IonItemDivider, IonLabel } from '@ionic/react';
import {
  clipboardOutline,
  thermometerOutline,
  cloudyOutline,
  personOutline,
} from 'ionicons/icons';
import { useRouteMatch } from 'react-router-dom';
import { Trans as T } from 'react-i18next';
import Sample from 'models/sample';
import { Main, MenuAttrItem, InfoMessage, CounterInput } from '@flumens';
import PhotoPicker from 'common/Components/PhotoPicker';
import windIcon from 'common/images/wind.svg';

type Props = {
  sample: Sample;
  onChangeCounter: (value: number) => void;
};

const AreaCountDetails: FC<Props> = ({ sample, onChangeCounter }) => {
  const match = useRouteMatch<any>();
  const baseURL = match.url;

  const isDisabled = sample.isDisabled();
  const { recorders, comment, cloud, temperature, windDirection, windSpeed } =
    sample.attrs;

  return (
    <Main>
      <IonList lines="full">
        <IonItemDivider>
          <IonLabel>
            <T>Weather Conditions</T>
          </IonLabel>
        </IonItemDivider>
        <div className="rounded">
          <MenuAttrItem
            routerLink={`${baseURL}/temperature`}
            disabled={isDisabled}
            icon={thermometerOutline}
            label="Temperature"
            value={temperature}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/cloud`}
            disabled={isDisabled}
            icon={cloudyOutline}
            label="Cloud"
            value={cloud}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/windDirection`}
            disabled={isDisabled}
            icon={windIcon}
            label="Wind Direction"
            value={windDirection}
          />

          <MenuAttrItem
            routerLink={`${baseURL}/windSpeed`}
            disabled={isDisabled}
            icon={windIcon}
            label="Wind Speed"
            value={windSpeed}
          />
        </div>

        <IonItemDivider>
          <IonLabel>
            <T>Photo</T>
          </IonLabel>
        </IonItemDivider>
        <div className="rounded">
          <PhotoPicker model={sample} />
          <InfoMessage color="medium">
            Representative photo of where the 15 minute count was made
          </InfoMessage>
        </div>

        <IonItemDivider>
          <IonLabel>
            <T>Other</T>
          </IonLabel>
        </IonItemDivider>
        <div className="rounded">
          <MenuAttrItem
            routerLink={`${baseURL}/comment`}
            disabled={isDisabled}
            icon={clipboardOutline}
            label="Comment"
            value={comment}
            skipValueTranslation
          />

          <CounterInput
            label="Recorders"
            onChange={onChangeCounter}
            value={recorders}
            icon={personOutline}
            min={1}
          />
          <InfoMessage color="medium">
            Enter the number of recorders of anyone who helped with this record
            - including your own.
          </InfoMessage>
        </div>
      </IonList>
    </Main>
  );
};

export default observer(AreaCountDetails);
