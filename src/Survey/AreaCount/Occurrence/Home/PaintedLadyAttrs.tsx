import { FC } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { MenuAttrItem, MenuAttrItemFromModel } from '@flumens';
import butterflyIcon from 'common/images/butterfly.svg';
import Occurrence from 'models/occurrence';
import PaintedLadyBehaviour from 'Survey/AreaCount/common/Components/PaintedLadyBehaviour';
import PaintedLadyWing from 'Survey/AreaCount/common/Components/PaintedLadyWing';

type Props = {
  occurrence: Occurrence;
};

const PaintedLadyAttrs: FC<Props> = ({ occurrence }) => {
  const isDisabled = occurrence.isUploaded();
  const { url } = useRouteMatch();

  if (!occurrence.attrs.behaviour && !occurrence.attrs.wing) {
    // eslint-disable-next-line no-param-reassign
    occurrence.attrs.behaviour = null;
    // eslint-disable-next-line no-param-reassign
    occurrence.attrs.wing = [];
    occurrence.save();
  }

  const { behaviour, wing, eggLaying } = occurrence.attrs;
  const migrating = behaviour === 'Migrating';
  const flowering = behaviour === 'Egg-laying hostplants';
  const nectaring = behaviour === 'Nectaring';
  const mating = behaviour === 'Mating';

  const hasThistle = eggLaying && eggLaying.includes('Thistles');
  const hasOther = eggLaying && eggLaying.includes('Other');

  const isStageAdult = occurrence.attrs.stage === 'Adult';

  return (
    <>
      {isStageAdult && (
        <MenuAttrItem
          routerLink={`${url}/wing`}
          value={<PaintedLadyWing wings={wing} />}
          label="Wing condition"
          icon={butterflyIcon}
          className="text-capitalize wing-value"
          disabled={isDisabled}
          skipValueTranslation
        />
      )}

      {isStageAdult && (
        <MenuAttrItem
          routerLink={`${url}/behaviour`}
          value={<PaintedLadyBehaviour behaviour={behaviour} showLabel />}
          label="Behaviour"
          icon={butterflyIcon}
          className="behaviour-value"
          disabled={isDisabled}
          skipValueTranslation
        />
      )}

      {migrating && isStageAdult && (
        <MenuAttrItemFromModel
          model={occurrence}
          attr="direction"
          className="direction-icon"
        />
      )}
      {migrating && isStageAdult && (
        <MenuAttrItemFromModel
          model={occurrence}
          attr="altitude"
          className="altitude-icon"
          skipValueTranslation
        />
      )}
      {nectaring && isStageAdult && (
        <MenuAttrItemFromModel model={occurrence} attr="nectarSource" />
      )}

      {mating && isStageAdult && (
        <MenuAttrItemFromModel model={occurrence} attr="mating" />
      )}

      {(flowering || !isStageAdult) && (
        <MenuAttrItemFromModel model={occurrence} attr="eggLaying" />
      )}

      {hasThistle && (
        <MenuAttrItemFromModel model={occurrence} attr="otherThistles" />
      )}

      {hasOther && (
        <MenuAttrItemFromModel model={occurrence} attr="otherEggLaying" />
      )}
    </>
  );
};

export default observer(PaintedLadyAttrs);
