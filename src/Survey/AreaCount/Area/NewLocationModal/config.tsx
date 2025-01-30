export const siteNameAttr = {
  id: 'name',
  type: 'text_input',
  title: 'Site name',
  container: 'inline',
} as const;

export const OTHER_SITE_SIZE_VALUE = '23733';

export const siteAreaAttr = {
  id: 'locAttr:376',
  type: 'choice_input',
  title: 'Site area',
  appearance: 'button',
  choices: [
    { title: '5 x 10 m', data_name: '23729' },
    { title: '20 x 25 m', data_name: '23730' },
    { title: '10 x 50 m', data_name: '23731' },
    { title: '5 x 100 m', data_name: '23732' },
    { title: 'other', data_name: OTHER_SITE_SIZE_VALUE },
  ],
} as const;

export const habitatAttr = {
  id: 'locAttr:340',
  type: 'choice_input',
  title: 'Dominant habitat',
  appearance: 'button',
  choices: [
    { title: 'Garden', data_name: '23571' },
    { title: 'Allotment gardens', data_name: '23573' },
    { title: 'Community garden', data_name: '23575' },
    { title: 'Balcony', data_name: '23577' },
    { title: 'Park (mixed vegetation)', data_name: '23579' },
    { title: 'Lawn', data_name: '23581' },
    { title: 'Flowering strip', data_name: '23583' },
    { title: 'Built-up area', data_name: '23585' },
    { title: 'Fallow land, abandoned area (urban)', data_name: '23587' },
    { title: 'Fallow land, abandoned field  (rural)', data_name: '23589' },
    { title: 'Field edge', data_name: '23591' },
    { title: 'Arable field', data_name: '23593' },
    { title: 'Grassland / Meadow / Pasture', data_name: '23595' },
    { title: 'Orchard', data_name: '23597' },
    { title: 'Forest edge', data_name: '23599' },
    { title: 'Woodland/Forest', data_name: '23601' },
    { title: 'Coastal', data_name: '23603' },
    { title: 'Wetland', data_name: '23605' },
    { title: 'Scrubland/Heathland', data_name: '23607' },
    { title: 'Sparsely vegetated', data_name: '23609' },
    { title: 'Desert / barren', data_name: '23611' },
    { title: 'Other', data_name: '23613' },
  ],
} as const;

export const grainsNumberAttr = {
  id: 'locAttr:341',
  type: 'number_input',
  title: 'Arable field grains (wheat, barley, rye)',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const customAreaSizeAttr = {
  id: 'locAttr:159',
  type: 'number_input',
  title: 'Area size',
  appearance: 'counter',
  placeholder: '0',
  suffix: 'm²',
  validations: { min: 0 },
} as const;

export const vegetablesNumberAttr = {
  id: 'locAttr:342',
  type: 'number_input',
  title: 'Arable field fruits or vegetables',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const rapeseedNumberAttr = {
  id: 'locAttr:343',
  type: 'number_input',
  title: 'Arable field rapeseed',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const cornNumberAttr = {
  id: 'locAttr:344',
  type: 'number_input',
  title: 'Arable field corn',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const legumesNumberAttr = {
  id: 'locAttr:345',
  type: 'number_input',
  title: 'Arable legumes',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const croppingNumberAttr = {
  id: 'locAttr:346',
  type: 'number_input',
  title: 'Arable multi-cropping',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const fallowNumberAttr = {
  id: 'locAttr:347',
  type: 'number_input',
  title: 'Arable fallow',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const managedGrasslandNumberAttr = {
  id: 'locAttr:348',
  type: 'number_input',
  title: 'Grassland homogeneous/intensively managed',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const grasslandNumberAttr = {
  id: 'locAttr:349',
  type: 'number_input',
  title: 'Grassland extensive or heterogeneous (pasture)',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const orchardNumberAttr = {
  id: 'locAttr:350',
  type: 'number_input',
  title: 'Orchard, vineyard or grove (sparse, pasture among trees)',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const orchardManagedNumberAttr = {
  id: 'locAttr:351',
  type: 'number_input',
  title: 'Orchard, vineyard or grove (intensely managed)',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const numberAttr = {
  id: 'locAttr:352',
  type: 'number_input',
  title: 'Scrubland',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const wastelandNumberAttr = {
  id: 'locAttr:353',
  type: 'number_input',
  title: 'Land laying fallow / wasteland',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const woodlandNumberAttr = {
  id: 'locAttr:354',
  type: 'number_input',
  title: 'Sparse woodland',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const forestNumberAttr = {
  id: 'locAttr:355',
  type: 'number_input',
  title: 'Dense woodland or forest',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const plantationNumberAttr = {
  id: 'locAttr:356',
  type: 'number_input',
  title: 'Plantation',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const gardenNumberAttr = {
  id: 'locAttr:357',
  type: 'number_input',
  title: 'Garden (single)',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const gardensNumberAttr = {
  id: 'locAttr:358',
  type: 'number_input',
  title: 'Gardens (multiple, e.g. allotment gardens)',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const buildingsNumberAttr = {
  id: 'locAttr:359',
  type: 'number_input',
  title: 'Building(s)',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const waterNumberAttr = {
  id: 'locAttr:360',
  type: 'number_input',
  title: 'Pond, lake or sea',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const riverNumberAttr = {
  id: 'locAttr:361',
  type: 'number_input',
  title: 'River or creek',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const wetlandNumberAttr = {
  id: 'locAttr:362',
  type: 'number_input',
  title: 'Wetland',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const landNumberAttr = {
  id: 'locAttr:363',
  type: 'number_input',
  title: 'Dunes or barren land',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const landscapeFeaturesAttr = {
  id: 'locAttr:364',
  type: 'choice_input',
  title: 'Landscape features',
  multiple: true,
  appearance: 'button',
  choices: [
    { title: 'Field edge(s)', data_name: '23615' },
    { title: 'Buffer-strip(s)', data_name: '23617' },
    { title: 'Flower-strip(s)', data_name: '23619' },
    { title: 'Hedge(s)', data_name: '23621' },
    { title: 'Scattered trees or trees in rows', data_name: '23623' },
    { title: 'Wooded area', data_name: '23625' },
    { title: 'Terraces, stone walls', data_name: '23627' },
    { title: 'Pond', data_name: '23629' },
    { title: 'River or creek', data_name: '23631' },
    { title: 'Path', data_name: '23633' },
    {
      title: 'Street, road or railroad tracks (sealed, e.g. asphalt)',
      data_name: '23635',
    },
    {
      title: 'Fences or other human-made linear structures',
      data_name: '23637',
    },
    { title: 'Dead tree, stumps or wood', data_name: '23639' },
    { title: 'Other', data_name: '23641' },
  ],
} as const;

export const otherLandscapeFeaturesAttr = {
  id: 'locAttr:375',
  type: 'text_input',
  title: 'Other landscape feature details',
  appearance: 'multiline',
  container: 'inline',
} as const;

export const treeNumberAttr = {
  id: 'locAttr:365',
  type: 'number_input',
  title: 'How many trees are there in the area of your observation site?',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const grassProportionAttr = {
  id: 'locAttr:366',
  type: 'number_input',
  title: 'What proportion of the site is a lawn or a grassland?',
  appearance: 'counter',
  placeholder: '0',
  validations: { min: 0, max: 100 },
} as const;

export const grassMownAttr = {
  id: 'locAttr:367',
  type: 'choice_input',
  title: 'How often is this lawn mown?',
  appearance: 'button',
  choices: [
    { title: 'Not applicable (not a grass / lawn)', data_name: '23643' },
    { title: "I don't know", data_name: '23645' },
    { title: 'Frequent mowing, all (relevant) area', data_name: '23647' },
    { title: 'Rare mowing (1-2 times a year), all area', data_name: '23649' },
    {
      title: 'Rare mowing (1-2 times a year), partial mowing (Staffelmahd)',
      data_name: '23651',
    },
    { title: 'Extensive grazing (few grazers, not mowed)', data_name: '23653' },
    { title: 'Intensive grazing (not mowed)', data_name: '23655' },
  ],
} as const;

export const fertilizedAttr = {
  id: 'locAttr:368',
  type: 'choice_input',
  title: 'Is the area fertilized?',
  appearance: 'button',
  choices: [
    { title: 'Not applicable', data_name: '23657' },
    { title: "I don't know", data_name: '23659' },
    { title: 'Frequent application', data_name: '23661' },
    { title: 'Rare application', data_name: '23663' },
    { title: 'No fertilizers used', data_name: '23665' },
    { title: 'Other', data_name: '23667' },
  ],
} as const;

export const otherFertilizerAttr = {
  id: 'locAttr:373',
  type: 'text_input',
  title: 'Other fertilizer details',
  appearance: 'multiline',
  container: 'inline',
} as const;

export const pesticidesAttr = {
  id: 'locAttr:369',
  type: 'choice_input',
  title: 'Are pesticides used?',
  appearance: 'button',
  choices: [
    { title: 'Not applicable', data_name: '23669' },
    { title: "I don't know", data_name: '23671' },
    { title: 'Frequent application', data_name: '23673' },
    { title: 'Rare application', data_name: '23675' },
    { title: 'No pesticides applied', data_name: '23677' },
    { title: 'Other', data_name: '23679' },
  ],
} as const;

export const otherPesticideAttr = {
  id: 'locAttr:374',
  type: 'text_input',
  title: 'Other pesticide details',
  appearance: 'multiline',
  container: 'inline',
} as const;

export const speciesAttr = {
  id: 'locAttr:370',
  type: 'choice_input',
  title: 'Are these plant species present in this location?',
  multiple: true,
  appearance: 'button',
  choices: [
    { title: 'Fruit trees and shrubs', data_name: '23681' },
    {
      title: 'Unmanaged corners (natural spaces, abandoned areas)',
      data_name: '23683',
    },
    { title: 'Vegetable patch', data_name: '23685' },
    { title: 'Lavender species', data_name: '23687' },
    { title: 'Geraniums & Pelargoniums', data_name: '23689' },
    { title: 'Valeriana', data_name: '23691' },
    { title: 'Legumes (Clover, Lupin, Lotus,...)', data_name: '23693' },
    { title: 'Marigold', data_name: '23695' },
    { title: 'Butterfly bush (or Summer Lilac)', data_name: '23697' },
    {
      title: 'Aromatics like Thyme, Oregano, etc. ( Lamiaceae)',
      data_name: '23699',
    },
    { title: 'Nettle (Urtica dioica)', data_name: '23701' },
    { title: 'Thistle species', data_name: '23703' },
    { title: 'Brambles (Rubus fruticosa)', data_name: '23705' },
    { title: 'Ivy', data_name: '23707' },
    { title: 'Knappweed (Centaurea and Scabiosa spp.)', data_name: '23709' },
    {
      title: 'Fennel, Carvi or others from the Carrot family (Apiaceae)',
      data_name: '23713',
    },
    {
      title: 'Cabbage, Rucola or others Mustard-plant family (Brassicaceae)',
      data_name: '23715',
    },
    { title: 'Hemp-agrimony (Eupatorium spp.)', data_name: '23711' },
  ],
} as const;

export const landOwnershipAttr = {
  id: 'locAttr:371',
  type: 'choice_input',
  title: 'Do you know who owns the land?',
  appearance: 'button',
  choices: [
    { title: 'I own the site', data_name: '23717' },
    { title: 'Private space', data_name: '23719' },
    { title: 'Public space', data_name: '23721' },
    { title: 'Communal space', data_name: '23723' },
    { title: 'Prefer not to say', data_name: '23725' },
    { title: "I don't know", data_name: '23727' },
  ],
} as const;

export const responsibleAttr = {
  id: 'locAttr:372',
  type: 'yes_no_input',
  title: 'Are you responsible for gardening activities at the site?',
  choices: [{ data_name: '0' }, { data_name: '1' }],
} as const;

export const commentAttr = {
  id: 'comment',
  type: 'text_input',
  title: 'Comments',
  appearance: 'multiline',
  container: 'inline',
} as const;
