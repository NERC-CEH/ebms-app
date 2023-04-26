import { FC } from 'react';
import { observer } from 'mobx-react';
import Sample from 'models/sample';
import { MenuAttrItem, MenuAttrItemFromModel } from '@flumens';
import { useRouteMatch } from 'react-router';
import butterflyIcon from 'common/images/butterfly.svg';

type Props = {
  sample: Sample;
};

const PaintedLadyAttrs: FC<Props> = ({ sample }) => {
  const isDisabled = sample.isUploaded();
  const { url } = useRouteMatch();
  const migrating = sample.attrs.behaviour === 'migrating';
  const eggLaying = sample.attrs.behaviour === 'egg-laying hostplants';
  const nectaring = sample.attrs.behaviour === 'nectaring';
  const mating = sample.attrs.behaviour === 'mating';
  const { wing } = sample.attrs;

  const getWingValue = () => {
    if (!wing.length) return null;

    if (wing.length > 1) return wing.length;

    return wing;
  };

  return (
    <>
      <MenuAttrItem
        routerLink={`${url}/wing`}
        value={getWingValue()}
        label="Wing"
        icon={butterflyIcon}
        className="text-capitalize"
        disabled={isDisabled}
      />

      <MenuAttrItemFromModel
        model={sample}
        attr="behaviour"
        className="text-capitalize"
      />

      {migrating && (
        <MenuAttrItemFromModel
          model={sample}
          attr="direction"
          className="direction-icon text-capitalize"
          skipValueTranslation
        />
      )}
      {migrating && (
        <MenuAttrItemFromModel
          model={sample}
          attr="altitude"
          className="altitude-icon"
          skipValueTranslation
        />
      )}
      {nectaring && (
        <MenuAttrItemFromModel
          model={sample}
          attr="nectarSource"
          className="text-capitalize"
        />
      )}
      {eggLaying && (
        <MenuAttrItemFromModel
          model={sample}
          attr="eggLaying"
          className="text-capitalize"
        />
      )}

      {mating && (
        <MenuAttrItemFromModel
          model={sample}
          attr="mating"
          className="text-capitalize"
        />
      )}
    </>
  );
};

export default observer(PaintedLadyAttrs);
