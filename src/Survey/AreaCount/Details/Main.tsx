import { observer } from 'mobx-react';
import {
  clipboardOutline,
  thermometerOutline,
  cloudyOutline,
  personOutline,
  eyeOffOutline,
  locationOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import {
  Main,
  MenuAttrItem,
  InfoMessage,
  NumberInput,
  Toggle,
  Block,
} from '@flumens';
import { IonList, IonIcon } from '@ionic/react';
import PhotoPicker from 'common/Components/PhotoPicker';
import windIcon from 'common/images/wind.svg';
import appModel from 'common/models/app';
import Location from 'common/models/location';
import Sample from 'models/sample';
import ProjectMenuItem from 'Survey/common/ProjectMenuItem';
import { guidAttr } from 'Survey/common/config';

type Props = {
  sample: Sample;
  site?: Location;
  onChangeCounter: (value: number | null) => void;
  onChangeSensitivityStatus: (value: boolean) => void;
};

const AreaCountDetails = ({
  sample,
  site,
  onChangeCounter,
  onChangeSensitivityStatus,
}: Props) => {
  const match = useRouteMatch();
  const baseURL = match.url;

  const { isDisabled } = sample;
  const { recorders, comment, cloud, temperature, windDirection, windSpeed } =
    sample.data;

  const isSwissUser = appModel.data.country === 'CH';

  return (
    <Main className="pb-ion-s-10">
      <IonList lines="full">
        <div className="rounded-list">
          <ProjectMenuItem
            isDisabled={isDisabled}
            groupId={sample.data.groupId}
          />
          <MenuAttrItem
            routerLink={`${baseURL}/site`}
            disabled={isDisabled}
            icon={locationOutline}
            label="common.site"
            value={site?.data.name}
            skipValueTranslation
          />
          {isSwissUser && (
            <Block
              record={sample.data}
              block={guidAttr}
              isDisabled={isDisabled}
            />
          )}
          <Toggle
            prefix={<IonIcon src={eyeOffOutline} className="size-6" />}
            label="area.sensitive"
            defaultSelected={Number.isFinite(sample.data.privacyPrecision)}
            onChange={onChangeSensitivityStatus}
            isDisabled={isDisabled}
          />
          <InfoMessage inline>area.surveyHasSensitive</InfoMessage>
          <PhotoPicker model={sample} />
          <InfoMessage inline>area.representativePhotoWhere</InfoMessage>
          <MenuAttrItem
            routerLink={`${baseURL}/comment`}
            disabled={isDisabled}
            icon={clipboardOutline}
            label="common.comment"
            value={comment}
            skipValueTranslation
          />

          <NumberInput
            label="area.recorders"
            onChange={onChangeCounter}
            value={recorders}
            prefix={<IonIcon src={personOutline} className="size-6" />}
            minValue={1}
            isDisabled={isDisabled}
          />
          <InfoMessage inline>area.enterNumberRecorders</InfoMessage>
        </div>

        <h3 className="list-title">
          <T>area.weatherConditions</T>
        </h3>
        <div className="rounded-list">
          <MenuAttrItem
            routerLink={`${baseURL}/temperature`}
            disabled={isDisabled}
            icon={thermometerOutline}
            label="common.temperature"
            value={temperature}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/cloud`}
            disabled={isDisabled}
            icon={cloudyOutline}
            label="common.cloud"
            value={cloud}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/windDirection`}
            disabled={isDisabled}
            icon={windIcon}
            label="common.windDirection"
            value={windDirection}
          />

          <MenuAttrItem
            routerLink={`${baseURL}/windSpeed`}
            disabled={isDisabled}
            icon={windIcon}
            label="common.windSpeed"
            value={windSpeed}
          />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(AreaCountDetails);
