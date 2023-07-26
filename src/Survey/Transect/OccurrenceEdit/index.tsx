import { FC } from 'react';
import { observer } from 'mobx-react';
import { Trans as T, useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import {
  Page,
  Header,
  Main,
  MenuAttrItemFromModel,
  MenuAttrItem,
  CounterInput,
} from '@flumens';
import { IonItemDivider, IonLabel, IonList } from '@ionic/react';
import PhotoPicker from 'common/Components/PhotoPicker';
import numberIcon from 'common/images/number.svg';
import Occurrence from 'models/occurrence';
import TaxonPrettyName from 'Survey/common/TaxonPrettyName';
import './styles.scss';

type Props = {
  occurrence: Occurrence;
};

const TransectHomeController: FC<Props> = ({ occurrence }) => {
  const { url } = useRouteMatch();
  const { t } = useTranslation();

  const species = occurrence.getTaxonCommonAndScientificNames();
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
              icon={occurrence.getSpeciesGroupIcon()}
              label="Species"
              value={<TaxonPrettyName name={species} />}
              skipValueTranslation
              className="taxon-entry"
            />

            <MenuAttrItemFromModel attr="comment" model={occurrence} />

            <CounterInput
              label={t('Count')}
              onChange={getCounterOnChange}
              value={count}
              icon={numberIcon}
              min={1}
              isDisabled={isDisabled}
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
