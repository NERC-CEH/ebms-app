import {
  ChoiceInputConf,
  NumberInputConf,
  TextInputConf,
  YesNoInputConf,
} from '@flumens';

export const siteNameAttr = {
  id: 'name',
  type: 'textInput',
  title: 'locations.siteName',
  container: 'inline',
} as const satisfies TextInputConf;

export const OTHER_SITE_SIZE_VALUE = '23733';

export const siteAreaAttr = {
  id: 'locAttr:376',
  type: 'choiceInput',
  title: 'locations.siteArea',
  appearance: 'button',
  choices: [
    { title: '5 x 10 m', dataName: '23729' },
    { title: '20 x 25 m', dataName: '23730' },
    { title: '10 x 50 m', dataName: '23731' },
    { title: '5 x 100 m', dataName: '23732' },
    { title: 'common.other', dataName: OTHER_SITE_SIZE_VALUE },
  ],
} as const satisfies ChoiceInputConf;

export const habitatAttr = {
  id: 'locAttr:340',
  type: 'choiceInput',
  title: 'locations.dominantHabitat',
  appearance: 'button',
  choices: [
    { title: 'locations.garden', dataName: '23571' },
    { title: 'locations.allotmentGardens', dataName: '23573' },
    { title: 'locations.communityGarden', dataName: '23575' },
    { title: 'locations.balcony', dataName: '23577' },
    { title: 'locations.parkMixedVegetation', dataName: '23579' },
    { title: 'locations.lawn', dataName: '23581' },
    { title: 'locations.floweringStrip', dataName: '23583' },
    { title: 'locations.builtUpArea', dataName: '23585' },
    { title: 'locations.fallowLandAbandoned', dataName: '23587' },
    { title: 'locations.ruralFallowLand', dataName: '23589' },
    { title: 'locations.fieldEdge', dataName: '23591' },
    { title: 'locations.arableField', dataName: '23593' },
    { title: 'locations.grassland', dataName: '23595' },
    { title: 'locations.orchard', dataName: '23597' },
    { title: 'locations.forestEdge', dataName: '23599' },
    { title: 'locations.woodlandForest', dataName: '23601' },
    { title: 'locations.coastal', dataName: '23603' },
    { title: 'locations.wetland', dataName: '23605' },
    { title: 'locations.scrublandHeathland', dataName: '23607' },
    { title: 'locations.sparselyVegetated', dataName: '23609' },
    { title: 'locations.desertBarren', dataName: '23611' },
    { title: 'common.other', dataName: '23613' },
  ],
} as const satisfies ChoiceInputConf;

export const grainsNumberAttr = {
  id: 'locAttr:341',
  type: 'numberInput',
  title: 'locations.arableFieldGrains',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const customAreaSizeAttr = {
  id: 'locAttr:159',
  type: 'numberInput',
  title: 'locations.areaSize',
  appearance: 'counter',
  placeholder: '0',
  suffix: 'm²',
  validation: { min: 0 },
} as const satisfies NumberInputConf;

export const vegetablesNumberAttr = {
  id: 'locAttr:342',
  type: 'numberInput',
  title: 'locations.arableFieldFruits',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const rapeseedNumberAttr = {
  id: 'locAttr:343',
  type: 'numberInput',
  title: 'locations.arableFieldRapeseed',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const cornNumberAttr = {
  id: 'locAttr:344',
  type: 'numberInput',
  title: 'locations.arableFieldCorn',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const legumesNumberAttr = {
  id: 'locAttr:345',
  type: 'numberInput',
  title: 'locations.arableLegumes',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const croppingNumberAttr = {
  id: 'locAttr:346',
  type: 'numberInput',
  title: 'locations.arableMultiCropping',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const fallowNumberAttr = {
  id: 'locAttr:347',
  type: 'numberInput',
  title: 'locations.arableFallow',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const managedGrasslandNumberAttr = {
  id: 'locAttr:348',
  type: 'numberInput',
  title: 'locations.intensiveGrassland',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const grasslandNumberAttr = {
  id: 'locAttr:349',
  type: 'numberInput',
  title: 'locations.extensiveGrassland',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const orchardNumberAttr = {
  id: 'locAttr:350',
  type: 'numberInput',
  title: 'locations.sparseOrchard',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const orchardManagedNumberAttr = {
  id: 'locAttr:351',
  type: 'numberInput',
  title: 'locations.orchardVineyardGrove',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const numberAttr = {
  id: 'locAttr:352',
  type: 'numberInput',
  title: 'locations.scrubland',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const wastelandNumberAttr = {
  id: 'locAttr:353',
  type: 'numberInput',
  title: 'locations.landLayingFallow',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const woodlandNumberAttr = {
  id: 'locAttr:354',
  type: 'numberInput',
  title: 'locations.sparseWoodland',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const forestNumberAttr = {
  id: 'locAttr:355',
  type: 'numberInput',
  title: 'locations.denseWoodlandForest',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const plantationNumberAttr = {
  id: 'locAttr:356',
  type: 'numberInput',
  title: 'locations.plantation',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const gardenNumberAttr = {
  id: 'locAttr:357',
  type: 'numberInput',
  title: 'locations.gardenSingle',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const gardensNumberAttr = {
  id: 'locAttr:358',
  type: 'numberInput',
  title: 'locations.gardensMultipleE',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const buildingsNumberAttr = {
  id: 'locAttr:359',
  type: 'numberInput',
  title: 'locations.buildingS',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const waterNumberAttr = {
  id: 'locAttr:360',
  type: 'numberInput',
  title: 'locations.pondLakeSea',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const riverNumberAttr = {
  id: 'locAttr:361',
  type: 'numberInput',
  title: 'locations.riverCreek',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const wetlandNumberAttr = {
  id: 'locAttr:362',
  type: 'numberInput',
  title: 'locations.wetland',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const landNumberAttr = {
  id: 'locAttr:363',
  type: 'numberInput',
  title: 'locations.dunesBarrenLand',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const landscapeFeaturesAttr = {
  id: 'locAttr:364',
  type: 'choiceInput',
  title: 'locations.landscapeFeatures',
  multiple: true,
  appearance: 'button',
  choices: [
    { title: 'locations.fieldEdgeS', dataName: '23615' },
    { title: 'locations.bufferStripS', dataName: '23617' },
    { title: 'locations.flowerStripS', dataName: '23619' },
    { title: 'locations.hedgeS', dataName: '23621' },
    { title: 'locations.scatteredTreesTrees', dataName: '23623' },
    { title: 'locations.woodedArea', dataName: '23625' },
    { title: 'locations.terracesStoneWalls', dataName: '23627' },
    { title: 'locations.pond', dataName: '23629' },
    { title: 'locations.riverCreek', dataName: '23631' },
    { title: 'locations.path', dataName: '23633' },
    {
      title: 'locations.streetRoadRailroad',
      dataName: '23635',
    },
    {
      title: 'locations.fencesOtherHuman',
      dataName: '23637',
    },
    { title: 'locations.deadTreeStumps', dataName: '23639' },
    { title: 'common.other', dataName: '23641' },
  ],
} as const satisfies ChoiceInputConf;

export const otherLandscapeFeaturesAttr = {
  id: 'locAttr:375',
  type: 'textInput',
  title: 'locations.landscapeDetails',
  appearance: 'multiline',
  container: 'inline',
} as const satisfies TextInputConf;

export const treeNumberAttr = {
  id: 'locAttr:365',
  type: 'numberInput',
  title: 'locations.howManyTrees',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const grassProportionAttr = {
  id: 'locAttr:366',
  type: 'numberInput',
  title: 'locations.lawnProportion',
  appearance: 'counter',
  placeholder: '0',
  suffix: '%',
  validation: { min: 0, max: 100 },
} as const satisfies NumberInputConf;

export const grassMownAttr = {
  id: 'locAttr:367',
  type: 'choiceInput',
  title: 'locations.howOftenLawn',
  appearance: 'button',
  choices: [
    { title: 'locations.notApplicableNot', dataName: '23643' },
    { title: 'locations.iDonT', dataName: '23645' },
    { title: 'locations.frequentMowingAll', dataName: '23647' },
    { title: 'locations.rareMowingAll', dataName: '23649' },
    {
      title: 'locations.rareMowingPartial',
      dataName: '23651',
    },
    { title: 'locations.extensiveGrazingFew', dataName: '23653' },
    { title: 'locations.intensiveGrazingNot', dataName: '23655' },
  ],
} as const satisfies ChoiceInputConf;

export const fertilizedAttr = {
  id: 'locAttr:368',
  type: 'choiceInput',
  title: 'locations.areaFertilized',
  appearance: 'button',
  choices: [
    { title: 'locations.notApplicable', dataName: '23657' },
    { title: 'locations.iDonT', dataName: '23659' },
    { title: 'locations.frequentApplication', dataName: '23661' },
    { title: 'locations.rareApplication', dataName: '23663' },
    { title: 'locations.noFertilizersUsed', dataName: '23665' },
    { title: 'common.other', dataName: '23667' },
  ],
} as const satisfies ChoiceInputConf;

export const otherFertilizerAttr = {
  id: 'locAttr:373',
  type: 'textInput',
  title: 'locations.fertilizerDetails',
  appearance: 'multiline',
  container: 'inline',
} as const satisfies TextInputConf;

export const pesticidesAttr = {
  id: 'locAttr:369',
  type: 'choiceInput',
  title: 'locations.pesticidesUsed',
  appearance: 'button',
  choices: [
    { title: 'locations.notApplicable', dataName: '23669' },
    { title: 'locations.iDonT', dataName: '23671' },
    { title: 'locations.frequentApplication', dataName: '23673' },
    { title: 'locations.rareApplication', dataName: '23675' },
    { title: 'locations.noPesticidesApplied', dataName: '23677' },
    { title: 'common.other', dataName: '23679' },
  ],
} as const satisfies ChoiceInputConf;

export const otherPesticideAttr = {
  id: 'locAttr:374',
  type: 'textInput',
  title: 'locations.pesticideDetails',
  appearance: 'multiline',
  container: 'inline',
} as const satisfies TextInputConf;

export const speciesAttr = {
  id: 'locAttr:370',
  type: 'choiceInput',
  title: 'locations.thesePlantSpecies',
  multiple: true,
  appearance: 'button',
  choices: [
    { title: 'locations.fruitTreesShrubs', dataName: '23681' },
    {
      title: 'locations.unmanagedAreas',
      dataName: '23683',
    },
    { title: 'locations.vegetablePatch', dataName: '23685' },
    { title: 'locations.lavenderSpecies', dataName: '23687' },
    { title: 'locations.geraniums', dataName: '23689' },
    { title: 'locations.valeriana', dataName: '23691' },
    { title: 'locations.legumesCloverLupin', dataName: '23693' },
    { title: 'locations.marigold', dataName: '23695' },
    { title: 'locations.butterflyBushSummer', dataName: '23697' },
    {
      title: 'locations.aromaticsLikeThyme',
      dataName: '23699',
    },
    { title: 'locations.nettleUrticaDioica', dataName: '23701' },
    { title: 'common.thistleSpecies', dataName: '23703' },
    { title: 'locations.brambles', dataName: '23705' },
    { title: 'locations.ivy', dataName: '23707' },
    { title: 'locations.knappweed', dataName: '23709' },
    {
      title: 'locations.fennelCarviOthers',
      dataName: '23713',
    },
    {
      title: 'locations.cabbageRucolaOthers',
      dataName: '23715',
    },
    { title: 'locations.hempAgrimony', dataName: '23711' },
  ],
} as const satisfies ChoiceInputConf;

export const landOwnershipAttr = {
  id: 'locAttr:371',
  type: 'choiceInput',
  title: 'locations.doKnowWho',
  appearance: 'button',
  choices: [
    { title: 'locations.iOwnSite', dataName: '23717' },
    { title: 'locations.privateSpace', dataName: '23719' },
    { title: 'locations.publicSpace', dataName: '23721' },
    { title: 'locations.communalSpace', dataName: '23723' },
    { title: 'locations.preferNotSay', dataName: '23725' },
    { title: 'locations.iDonT', dataName: '23727' },
  ],
} as const satisfies ChoiceInputConf;

export const responsibleAttr = {
  id: 'locAttr:372',
  type: 'yesNoInput',
  title: 'locations.manageSite',
  choices: [{ dataName: '0' }, { dataName: '1' }],
} as const satisfies YesNoInputConf;

export const commentAttr = {
  id: 'comment',
  type: 'textInput',
  title: 'common.comments',
  appearance: 'multiline',
  container: 'inline',
} as const satisfies TextInputConf;
