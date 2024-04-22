import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import {
  Page,
  Header,
  Main,
  MenuAttrItemFromModel,
  MenuAttrItem,
  NumberInput,
} from '@flumens';
import { IonIcon, IonList } from '@ionic/react';
import PhotoPicker from 'common/Components/PhotoPicker';
import numberIcon from 'common/images/number.svg';
import Occurrence from 'models/occurrence';
import TaxonPrettyName from 'Survey/common/TaxonPrettyName';
import './styles.scss';

type Props = {
  occurrence: Occurrence;
};

const TransectHomeController = ({ occurrence }: Props) => {
  const { url } = useRouteMatch();

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
          <div className="rounded-list">
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

            <NumberInput
              label="Count"
              onChange={getCounterOnChange}
              value={count}
              prefix={<IonIcon src={numberIcon} className="size-6" />}
              minValue={1}
              isDisabled={isDisabled}
            />
          </div>

          <h3 className="list-title">
            <T>Species Photo</T>
          </h3>
          <div className="rounded-list">
            <PhotoPicker model={occurrence} />
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(TransectHomeController);
