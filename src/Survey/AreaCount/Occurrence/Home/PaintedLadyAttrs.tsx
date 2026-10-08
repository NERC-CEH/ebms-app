import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { MenuAttrItem, MenuAttrItemFromModel } from '@flumens';
import butterflyIcon from 'common/images/butterfly.svg';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import PaintedLadyBehaviour from 'Survey/AreaCount/common/Components/PaintedLadyBehaviour';
import PaintedLadyWing from 'Survey/AreaCount/common/Components/PaintedLadyWing';
import AttrLock from 'Survey/common/AttrLock';

const BEHAVIOUR_LINKED_ATTRIBUTES = [
  'nectarSource',
  'direction',
  'altitude',
  'mating',
  'eggLaying',
  'otherThistles',
  'otherEggLaying',
] as const;

type Props = {
  sample: Sample;
  occurrence: Occurrence;
};

const PaintedLadyAttrs = ({ sample, occurrence }: Props) => {
  const isDisabled = occurrence.isUploaded;
  const { url } = useRouteMatch();

  if (!occurrence.data.behaviour && !occurrence.data.wing) {
    delete occurrence.data.behaviour;

    occurrence.data.wing = [];
    occurrence.save();
  }

  const {
    behaviour,
    wing,
    eggLaying,
    direction,
    altitude,
    nectarSource,
    mating: matingValue,
    otherThistles,
    otherEggLaying,
    taxon,
  } = occurrence.data;

  const taxonGroup = taxon.taxonGroupId;
  const migrating = behaviour === 'Migrating';
  const flowering = behaviour === 'Egg-laying hostplants';
  const nectaring = behaviour === 'Nectaring';
  const mating = behaviour === 'Mating';

  const hasThistle = eggLaying?.includes('Thistles');
  const hasOther = eggLaying?.includes('Other');

  const isStageAdult = occurrence.data.stage === 'Adult';

  const lockBehaviour = (
    _: string | number | null | undefined,
    model: 'occ' | 'smp',
    attr: string,
    value: unknown
  ) => {
    if (!behaviour) return;
    sample.locks.set(taxonGroup, model, attr, value);
    sample.locks.set(taxonGroup, 'occ', 'behaviour', behaviour);

    if (attr === 'otherThistles' || attr === 'otherEggLaying') {
      sample.locks.set(taxonGroup, 'occ', 'eggLaying', eggLaying);
    }
  };

  const unlockBehaviour = () => {
    BEHAVIOUR_LINKED_ATTRIBUTES.forEach(attr => {
      sample.locks.unset(taxonGroup, 'occ', attr);
    });
  };

  return (
    <>
      {isStageAdult && (
        <AttrLock
          sample={sample}
          taxonGroup={taxonGroup}
          model="occ"
          attr="wing"
          value={wing?.length ? wing : null}
        >
          <MenuAttrItem
            routerLink={`${url}/wing`}
            value={<PaintedLadyWing wings={wing || []} />}
            label="area.wingCondition"
            icon={butterflyIcon}
            className="text-capitalize wing-value"
            disabled={isDisabled}
            skipValueTranslation
          />
        </AttrLock>
      )}

      {isStageAdult && (
        <AttrLock
          sample={sample}
          taxonGroup={taxonGroup}
          model="occ"
          attr="behaviour"
          value={behaviour}
          onUnlock={unlockBehaviour}
        >
          <MenuAttrItem
            routerLink={`${url}/behaviour`}
            value={
              <PaintedLadyBehaviour behaviour={behaviour || ''} showLabel />
            }
            label="area.behaviour"
            icon={butterflyIcon}
            className="behaviour-value"
            disabled={isDisabled}
            skipValueTranslation
          />
        </AttrLock>
      )}

      {migrating && isStageAdult && (
        <AttrLock
          sample={sample}
          taxonGroup={taxonGroup}
          model="occ"
          attr="direction"
          value={direction}
          onLock={lockBehaviour}
        >
          <MenuAttrItemFromModel
            model={occurrence}
            attr="direction"
            className="direction-icon"
          />
        </AttrLock>
      )}
      {migrating && isStageAdult && (
        <AttrLock
          sample={sample}
          taxonGroup={taxonGroup}
          model="occ"
          attr="altitude"
          value={altitude}
          onLock={lockBehaviour}
        >
          <MenuAttrItemFromModel
            model={occurrence}
            attr="altitude"
            className="altitude-icon"
            skipValueTranslation
          />
        </AttrLock>
      )}
      {nectaring && isStageAdult && (
        <AttrLock
          sample={sample}
          taxonGroup={taxonGroup}
          model="occ"
          attr="nectarSource"
          value={nectarSource}
          onLock={lockBehaviour}
        >
          <MenuAttrItemFromModel model={occurrence} attr="nectarSource" />
        </AttrLock>
      )}

      {mating && isStageAdult && (
        <AttrLock
          sample={sample}
          taxonGroup={taxonGroup}
          model="occ"
          attr="mating"
          value={matingValue}
          onLock={lockBehaviour}
        >
          <MenuAttrItemFromModel model={occurrence} attr="mating" />
        </AttrLock>
      )}

      {(flowering || !isStageAdult) && (
        <AttrLock
          sample={sample}
          taxonGroup={taxonGroup}
          model="occ"
          attr="eggLaying"
          value={eggLaying?.length ? eggLaying : null}
        >
          <MenuAttrItemFromModel model={occurrence} attr="eggLaying" />
        </AttrLock>
      )}

      {hasThistle && (
        <AttrLock
          sample={sample}
          taxonGroup={taxonGroup}
          model="occ"
          attr="otherThistles"
          value={otherThistles}
          onLock={lockBehaviour}
        >
          <MenuAttrItemFromModel model={occurrence} attr="otherThistles" />
        </AttrLock>
      )}

      {hasOther && (
        <AttrLock
          sample={sample}
          taxonGroup={taxonGroup}
          model="occ"
          attr="otherEggLaying"
          value={otherEggLaying}
          onLock={lockBehaviour}
        >
          <MenuAttrItemFromModel model={occurrence} attr="otherEggLaying" />
        </AttrLock>
      )}
    </>
  );
};

export default observer(PaintedLadyAttrs);
