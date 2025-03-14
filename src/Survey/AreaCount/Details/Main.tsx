import { observer } from 'mobx-react';
import {
  clipboardOutline,
  thermometerOutline,
  peopleOutline,
  cloudyOutline,
  personOutline,
  eyeOffOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import { Main, MenuAttrItem, InfoMessage, NumberInput, Toggle } from '@flumens';
import { IonList, IonIcon } from '@ionic/react';
import PhotoPicker from 'common/Components/PhotoPicker';
import windIcon from 'common/images/wind.svg';
import Sample from 'models/sample';

type Props = {
  sample: Sample;
  onChangeCounter: (value: number | null) => void;
  onChangeSensitivityStatus: (value: boolean) => void;
};

const AreaCountDetails = ({
  sample,
  onChangeCounter,
  onChangeSensitivityStatus,
}: Props) => {
  const match = useRouteMatch<any>();
  const baseURL = match.url;

  const { isDisabled } = sample;
  const {
    recorders,
    comment,
    cloud,
    temperature,
    windDirection,
    windSpeed,
    group,
  } = sample.data;

  return (
    <Main>
      <IonList lines="full">
        <h3 className="list-title">
          <T>Weather Conditions</T>
        </h3>
        <div className="rounded-list">
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

        <h3 className="list-title">
          <T>Photo</T>
        </h3>
        <div className="rounded-list">
          <PhotoPicker model={sample} />
          <InfoMessage inline>
            Representative photo of where the 15 minute count was made
          </InfoMessage>
        </div>

        <h3 className="list-title">
          <T>Other</T>
        </h3>
        <div className="rounded-list">
          <MenuAttrItem
            routerLink={`${baseURL}/group`}
            disabled={isDisabled}
            icon={peopleOutline}
            label="Project"
            value={group?.title}
            skipValueTranslation
          />
          <Toggle
            prefix={<IonIcon src={eyeOffOutline} className="size-6" />}
            label="Sensitive"
            defaultSelected={Number.isFinite(sample.data.privacyPrecision)}
            onChange={onChangeSensitivityStatus}
            isDisabled={isDisabled}
          />
          <InfoMessage inline>
            This survey has sensitive species and should not be included in
            public reports.
          </InfoMessage>
          <MenuAttrItem
            routerLink={`${baseURL}/comment`}
            disabled={isDisabled}
            icon={clipboardOutline}
            label="Comment"
            value={comment}
            skipValueTranslation
          />

          <NumberInput
            label="Recorders"
            onChange={onChangeCounter}
            value={recorders}
            prefix={<IonIcon src={personOutline} className="size-6" />}
            minValue={1}
            isDisabled={isDisabled}
          />
          <InfoMessage inline>
            Enter the number of recorders of anyone who helped with this record
            - including your own.
          </InfoMessage>
        </div>
      </IonList>
    </Main>
  );
};

export default observer(AreaCountDetails);
