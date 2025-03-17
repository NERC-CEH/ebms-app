export const siteNameAttr = {
  id: 'name',
  type: 'textInput',
  title: 'Site name',
  container: 'inline',
} as const;

export const OTHER_SITE_SIZE_VALUE = '23733';

export const siteAreaAttr = {
  id: 'locAttr:376',
  type: 'choiceInput',
  title: 'Site area',
  appearance: 'button',
  choices: [
    { title: '5 x 10 m', dataName: '23729' },
    { title: '20 x 25 m', dataName: '23730' },
    { title: '10 x 50 m', dataName: '23731' },
    { title: '5 x 100 m', dataName: '23732' },
    { title: 'other', dataName: OTHER_SITE_SIZE_VALUE },
  ],
} as const;

export const habitatAttr = {
  id: 'locAttr:340',
  type: 'choiceInput',
  title: 'Dominant habitat',
  appearance: 'button',
  choices: [
    { title: 'Garden', dataName: '23571' },
    { title: 'Allotment gardens', dataName: '23573' },
    { title: 'Community garden', dataName: '23575' },
    { title: 'Balcony', dataName: '23577' },
    { title: 'Park (mixed vegetation)', dataName: '23579' },
    { title: 'Lawn', dataName: '23581' },
    { title: 'Flowering strip', dataName: '23583' },
    { title: 'Built-up area', dataName: '23585' },
    { title: 'Fallow land, abandoned area (urban)', dataName: '23587' },
    { title: 'Fallow land, abandoned field  (rural)', dataName: '23589' },
    { title: 'Field edge', dataName: '23591' },
    { title: 'Arable field', dataName: '23593' },
    { title: 'Grassland / Meadow / Pasture', dataName: '23595' },
    { title: 'Orchard', dataName: '23597' },
    { title: 'Forest edge', dataName: '23599' },
    { title: 'Woodland/Forest', dataName: '23601' },
    { title: 'Coastal', dataName: '23603' },
    { title: 'Wetland', dataName: '23605' },
    { title: 'Scrubland/Heathland', dataName: '23607' },
    { title: 'Sparsely vegetated', dataName: '23609' },
    { title: 'Desert / barren', dataName: '23611' },
    { title: 'Other', dataName: '23613' },
  ],
} as const;

export const grainsNumberAttr = {
  id: 'locAttr:341',
  type: 'numberInput',
  title: 'Arable field grains (wheat, barley, rye)',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const customAreaSizeAttr = {
  id: 'locAttr:159',
  type: 'numberInput',
  title: 'Area size',
  appearance: 'counter',
  placeholder: '0',
  suffix: 'm²',
  validation: { min: 0 },
} as const;

export const vegetablesNumberAttr = {
  id: 'locAttr:342',
  type: 'numberInput',
  title: 'Arable field fruits or vegetables',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const rapeseedNumberAttr = {
  id: 'locAttr:343',
  type: 'numberInput',
  title: 'Arable field rapeseed',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const cornNumberAttr = {
  id: 'locAttr:344',
  type: 'numberInput',
  title: 'Arable field corn',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const legumesNumberAttr = {
  id: 'locAttr:345',
  type: 'numberInput',
  title: 'Arable legumes',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const croppingNumberAttr = {
  id: 'locAttr:346',
  type: 'numberInput',
  title: 'Arable multi-cropping',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const fallowNumberAttr = {
  id: 'locAttr:347',
  type: 'numberInput',
  title: 'Arable fallow',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const managedGrasslandNumberAttr = {
  id: 'locAttr:348',
  type: 'numberInput',
  title: 'Grassland homogeneous/intensively managed',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const grasslandNumberAttr = {
  id: 'locAttr:349',
  type: 'numberInput',
  title: 'Grassland extensive or heterogeneous (pasture)',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const orchardNumberAttr = {
  id: 'locAttr:350',
  type: 'numberInput',
  title: 'Orchard, vineyard or grove (sparse, pasture among trees)',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const orchardManagedNumberAttr = {
  id: 'locAttr:351',
  type: 'numberInput',
  title: 'Orchard, vineyard or grove (intensely managed)',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const numberAttr = {
  id: 'locAttr:352',
  type: 'numberInput',
  title: 'Scrubland',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const wastelandNumberAttr = {
  id: 'locAttr:353',
  type: 'numberInput',
  title: 'Land laying fallow / wasteland',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const woodlandNumberAttr = {
  id: 'locAttr:354',
  type: 'numberInput',
  title: 'Sparse woodland',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const forestNumberAttr = {
  id: 'locAttr:355',
  type: 'numberInput',
  title: 'Dense woodland or forest',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const plantationNumberAttr = {
  id: 'locAttr:356',
  type: 'numberInput',
  title: 'Plantation',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const gardenNumberAttr = {
  id: 'locAttr:357',
  type: 'numberInput',
  title: 'Garden (single)',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const gardensNumberAttr = {
  id: 'locAttr:358',
  type: 'numberInput',
  title: 'Gardens (multiple, e.g. allotment gardens)',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const buildingsNumberAttr = {
  id: 'locAttr:359',
  type: 'numberInput',
  title: 'Building(s)',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const waterNumberAttr = {
  id: 'locAttr:360',
  type: 'numberInput',
  title: 'Pond, lake or sea',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const riverNumberAttr = {
  id: 'locAttr:361',
  type: 'numberInput',
  title: 'River or creek',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const wetlandNumberAttr = {
  id: 'locAttr:362',
  type: 'numberInput',
  title: 'Wetland',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const landNumberAttr = {
  id: 'locAttr:363',
  type: 'numberInput',
  title: 'Dunes or barren land',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const landscapeFeaturesAttr = {
  id: 'locAttr:364',
  type: 'choiceInput',
  title: 'Landscape features',
  multiple: true,
  appearance: 'button',
  choices: [
    { title: 'Field edge(s)', dataName: '23615' },
    { title: 'Buffer-strip(s)', dataName: '23617' },
    { title: 'Flower-strip(s)', dataName: '23619' },
    { title: 'Hedge(s)', dataName: '23621' },
    { title: 'Scattered trees or trees in rows', dataName: '23623' },
    { title: 'Wooded area', dataName: '23625' },
    { title: 'Terraces, stone walls', dataName: '23627' },
    { title: 'Pond', dataName: '23629' },
    { title: 'River or creek', dataName: '23631' },
    { title: 'Path', dataName: '23633' },
    {
      title: 'Street, road or railroad tracks (sealed, e.g. asphalt)',
      dataName: '23635',
    },
    {
      title: 'Fences or other human-made linear structures',
      dataName: '23637',
    },
    { title: 'Dead tree, stumps or wood', dataName: '23639' },
    { title: 'Other', dataName: '23641' },
  ],
} as const;

export const otherLandscapeFeaturesAttr = {
  id: 'locAttr:375',
  type: 'textInput',
  title: 'Other landscape feature details',
  appearance: 'multiline',
  container: 'inline',
} as const;

export const treeNumberAttr = {
  id: 'locAttr:365',
  type: 'numberInput',
  title: 'How many trees are there in the area of your observation site?',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const grassProportionAttr = {
  id: 'locAttr:366',
  type: 'numberInput',
  title: 'What proportion of the site is a lawn or a grassland?',
  appearance: 'counter',
  placeholder: '0',
  validation: { min: 0, max: 100 },
} as const;

export const grassMownAttr = {
  id: 'locAttr:367',
  type: 'choiceInput',
  title: 'How often is this lawn mown?',
  appearance: 'button',
  choices: [
    { title: 'Not applicable (not a grass / lawn)', dataName: '23643' },
    { title: "I don't know", dataName: '23645' },
    { title: 'Frequent mowing, all (relevant) area', dataName: '23647' },
    { title: 'Rare mowing (1-2 times a year), all area', dataName: '23649' },
    {
      title: 'Rare mowing (1-2 times a year), partial mowing (Staffelmahd)',
      dataName: '23651',
    },
    { title: 'Extensive grazing (few grazers, not mowed)', dataName: '23653' },
    { title: 'Intensive grazing (not mowed)', dataName: '23655' },
  ],
} as const;

export const fertilizedAttr = {
  id: 'locAttr:368',
  type: 'choiceInput',
  title: 'Is the area fertilized?',
  appearance: 'button',
  choices: [
    { title: 'Not applicable', dataName: '23657' },
    { title: "I don't know", dataName: '23659' },
    { title: 'Frequent application', dataName: '23661' },
    { title: 'Rare application', dataName: '23663' },
    { title: 'No fertilizers used', dataName: '23665' },
    { title: 'Other', dataName: '23667' },
  ],
} as const;

export const otherFertilizerAttr = {
  id: 'locAttr:373',
  type: 'textInput',
  title: 'Other fertilizer details',
  appearance: 'multiline',
  container: 'inline',
} as const;

export const pesticidesAttr = {
  id: 'locAttr:369',
  type: 'choiceInput',
  title: 'Are pesticides used?',
  appearance: 'button',
  choices: [
    { title: 'Not applicable', dataName: '23669' },
    { title: "I don't know", dataName: '23671' },
    { title: 'Frequent application', dataName: '23673' },
    { title: 'Rare application', dataName: '23675' },
    { title: 'No pesticides applied', dataName: '23677' },
    { title: 'Other', dataName: '23679' },
  ],
} as const;

export const otherPesticideAttr = {
  id: 'locAttr:374',
  type: 'textInput',
  title: 'Other pesticide details',
  appearance: 'multiline',
  container: 'inline',
} as const;

export const speciesAttr = {
  id: 'locAttr:370',
  type: 'choiceInput',
  title: 'Are these plant species present in this location?',
  multiple: true,
  appearance: 'button',
  choices: [
    { title: 'Fruit trees and shrubs', dataName: '23681' },
    {
      title: 'Unmanaged corners (natural spaces, abandoned areas)',
      dataName: '23683',
    },
    { title: 'Vegetable patch', dataName: '23685' },
    { title: 'Lavender species', dataName: '23687' },
    { title: 'Geraniums & Pelargoniums', dataName: '23689' },
    { title: 'Valeriana', dataName: '23691' },
    { title: 'Legumes (Clover, Lupin, Lotus,...)', dataName: '23693' },
    { title: 'Marigold', dataName: '23695' },
    { title: 'Butterfly bush (or Summer Lilac)', dataName: '23697' },
    {
      title: 'Aromatics like Thyme, Oregano, etc. ( Lamiaceae)',
      dataName: '23699',
    },
    { title: 'Nettle (Urtica dioica)', dataName: '23701' },
    { title: 'Thistle species', dataName: '23703' },
    { title: 'Brambles (Rubus fruticosa)', dataName: '23705' },
    { title: 'Ivy', dataName: '23707' },
    { title: 'Knappweed (Centaurea and Scabiosa spp.)', dataName: '23709' },
    {
      title: 'Fennel, Carvi or others from the Carrot family (Apiaceae)',
      dataName: '23713',
    },
    {
      title: 'Cabbage, Rucola or others Mustard-plant family (Brassicaceae)',
      dataName: '23715',
    },
    { title: 'Hemp-agrimony (Eupatorium spp.)', dataName: '23711' },
  ],
} as const;

export const landOwnershipAttr = {
  id: 'locAttr:371',
  type: 'choiceInput',
  title: 'Do you know who owns the land?',
  appearance: 'button',
  choices: [
    { title: 'I own the site', dataName: '23717' },
    { title: 'Private space', dataName: '23719' },
    { title: 'Public space', dataName: '23721' },
    { title: 'Communal space', dataName: '23723' },
    { title: 'Prefer not to say', dataName: '23725' },
    { title: "I don't know", dataName: '23727' },
  ],
} as const;

export const responsibleAttr = {
  id: 'locAttr:372',
  type: 'yesNoInput',
  title: 'Are you responsible for gardening activities at the site?',
  choices: [{ dataName: '0' }, { dataName: '1' }],
} as const;

export const commentAttr = {
  id: 'comment',
  type: 'textInput',
  title: 'Comments',
  appearance: 'multiline',
  container: 'inline',
} as const;
