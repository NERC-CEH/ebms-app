import { FC } from 'react';
import { observer } from 'mobx-react';
import Occurrence from 'models/occurrence';
import { MenuAttrItem, MenuAttrItemFromModel } from '@flumens';
import { useRouteMatch } from 'react-router';
import butterflyIcon from 'common/images/butterfly.svg';
import PaintedLadyWing from './PaintedLadyWing';
import PaintedLadyBehaviour from './PaintedLadyBehaviour';

type Props = {
  occurrence: Occurrence;
};

const PaintedLadyAttrs: FC<Props> = ({ occurrence }) => {
  if (!occurrence.attrs.behaviour && !occurrence.attrs.wing) {
    // eslint-disable-next-line no-param-reassign
    occurrence.attrs.behaviour = null;
    // eslint-disable-next-line no-param-reassign
    occurrence.attrs.wing = [];
    occurrence.save();
  }

  const isDisabled = occurrence.isUploaded();
  const { url } = useRouteMatch();

  const { behaviour, wing, eggLaying } = occurrence.attrs;
  const migrating = behaviour === 'Migrating';
  const flowering = behaviour === 'Egg-laying hostplants';
  const nectaring = behaviour === 'Nectaring';
  const mating = behaviour === 'Mating';

  const hasThistle = eggLaying && eggLaying.includes('Thistles');
  const hasOther = eggLaying && eggLaying.includes('Other');

  return (
    <>
      <MenuAttrItem
        routerLink={`${url}/wing`}
        value={<PaintedLadyWing wings={wing} />}
        label="Wing condition"
        icon={butterflyIcon}
        className="text-capitalize wing-value"
        disabled={isDisabled}
        skipValueTranslation
      />

      <MenuAttrItem
        routerLink={`${url}/behaviour`}
        value={<PaintedLadyBehaviour behaviour={behaviour} showLabel />}
        label="Behaviour"
        icon={butterflyIcon}
        className="behaviour-value"
        disabled={isDisabled}
        skipValueTranslation
      />

      {migrating && (
        <MenuAttrItemFromModel
          model={occurrence}
          attr="direction"
          className="direction-icon"
        />
      )}
      {migrating && (
        <MenuAttrItemFromModel
          model={occurrence}
          attr="altitude"
          className="altitude-icon"
          skipValueTranslation
        />
      )}
      {nectaring && (
        <MenuAttrItemFromModel model={occurrence} attr="nectarSource" />
      )}
      {flowering && (
        <MenuAttrItemFromModel model={occurrence} attr="eggLaying" />
      )}

      {hasThistle && (
        <MenuAttrItemFromModel model={occurrence} attr="otherThistles" />
      )}

      {hasOther && (
        <MenuAttrItemFromModel model={occurrence} attr="otherEggLaying" />
      )}

      {mating && <MenuAttrItemFromModel model={occurrence} attr="mating" />}
    </>
  );
};

export default observer(PaintedLadyAttrs);
