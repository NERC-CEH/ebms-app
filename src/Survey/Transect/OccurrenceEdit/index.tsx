import { FC } from 'react';
import { observer } from 'mobx-react';
import Occurrence from 'models/occurrence';
import { useRouteMatch } from 'react-router';
import { IonItemDivider, IonLabel, IonList } from '@ionic/react';
import { Trans as T, useTranslation } from 'react-i18next';
import {
  Page,
  Header,
  Main,
  MenuAttrItemFromModel,
  MenuAttrItem,
  CounterInput,
} from '@flumens';
import PhotoPicker from 'common/Components/PhotoPicker';
import butterflyIcon from 'common/images/butterfly.svg';
import numberIcon from 'common/images/number.svg';
import './styles.scss';

type Props = {
  occurrence: Occurrence;
};

const TransectHomeController: FC<Props> = ({ occurrence }) => {
  const { url } = useRouteMatch();
  const { t } = useTranslation();

  const species = occurrence.getTaxonName();
  const isDisabled = occurrence.isUploaded();

  const getCounterOnChange = (value: number) => {
    // eslint-disable-next-line no-param-reassign
    occurrence.attrs.count = value;
    occurrence.save();
  };

  const { count } = occurrence.attrs;

  return (
    <Page id="section-occurrence-edit">
      <Header title="Edit Occurrence" />
      <Main>
        <IonList lines="full">
          <div className="rounded">
            <MenuAttrItem
              routerLink={`${url}/taxa`}
              disabled={isDisabled}
              icon={butterflyIcon}
              label="Species"
              value={species}
            />

            <MenuAttrItemFromModel attr="stage" model={occurrence} />
            <MenuAttrItemFromModel attr="comment" model={occurrence} />

            <CounterInput
              label={t('Count')}
              onChange={getCounterOnChange}
              value={count}
              icon={numberIcon}
              min={1}
            />
          </div>

          <IonItemDivider>
            <IonLabel>
              <T>Species Photo</T>
            </IonLabel>
          </IonItemDivider>
          <div className="rounded">
            <PhotoPicker model={occurrence} />
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(TransectHomeController);
