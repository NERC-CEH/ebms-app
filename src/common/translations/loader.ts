import { addNamespace as ionic } from '@flumens/ionic/locales';
import { addNamespace as tailwind } from '@flumens/tailwind/locales';
import bgInterface from './interface/bg-BG.json';
import caInterface from './interface/ca-ES.json';
import csInterface from './interface/cs-CZ.json';
import daInterface from './interface/da-DK.json';
import deInterface from './interface/de-DE.json';
import elInterface from './interface/el-GR.json';
import enInterface from './interface/en.json';
import esInterface from './interface/es-ES.json';
import fiInterface from './interface/fi-FI.json';
import frInterface from './interface/fr-FR.json';
import glInterface from './interface/gl-ES.json';
import hrInterface from './interface/hr-HR.json';
import huInterface from './interface/hu-HU.json';
import itInterface from './interface/it-IT.json';
import jaInterface from './interface/ja-JP.json';
import ltInterface from './interface/lt-LT.json';
import lvInterface from './interface/lv-LV.json';
import nlInterface from './interface/nl-NL.json';
import plInterface from './interface/pl-PL.json';
import ptInterface from './interface/pt-PT.json';
import roInterface from './interface/ro-RO.json';
import ruInterface from './interface/ru-RU.json';
import skInterface from './interface/sk-SK.json';
import slInterface from './interface/sl-SI.json';
import sqInterface from './interface/sq-AL.json';
import srLatnInterface from './interface/sr-Latn.json';
import srInterface from './interface/sr-RS.json';
import svInterface from './interface/sv-SE.json';
import trInterface from './interface/tr-TR.json';
import bgSpecies from './species/bg-BG.json';
import caSpecies from './species/ca-ES.json';
import csSpecies from './species/cs-CZ.json';
import daSpecies from './species/da-DK.json';
import deSpecies from './species/de-DE.json';
import elSpecies from './species/el-GR.json';
import enSpecies from './species/en.json';
import esSpecies from './species/es-ES.json';
import fiSpecies from './species/fi-FI.json';
import frSpecies from './species/fr-FR.json';
import glSpecies from './species/gl-ES.json';
import hrSpecies from './species/hr-HR.json';
import huSpecies from './species/hu-HU.json';
import itSpecies from './species/it-IT.json';
import jaSpecies from './species/ja-JP.json';
import ltSpecies from './species/lt-LT.json';
import nlSpecies from './species/nl-NL.json';
import plSpecies from './species/pl-PL.json';
import ptSpecies from './species/pt-PT.json';
import roSpecies from './species/ro-RO.json';
import ruSpecies from './species/ru-RU.json';
import skSpecies from './species/sk-SK.json';
import slSpecies from './species/sl-SI.json';
import sqSpecies from './species/sq-AL.json';
import srSpecies from './species/sr-RS.json';
import svSpecies from './species/sv-SE.json';
import trSpecies from './species/tr-TR.json';

export const defaultNS = 'interface';

export const resources = {
  en: { interface: enInterface, species: enSpecies },
  'bg-BG': { interface: bgInterface, species: bgSpecies },
  'ca-ES': { interface: caInterface, species: caSpecies },
  'cs-CZ': { interface: csInterface, species: csSpecies },
  'da-DK': { interface: daInterface, species: daSpecies },
  'de-DE': { interface: deInterface, species: deSpecies },
  'el-GR': { interface: elInterface, species: elSpecies },
  'es-ES': { interface: esInterface, species: esSpecies },
  'fi-FI': { interface: fiInterface, species: fiSpecies },
  'fr-FR': { interface: frInterface, species: frSpecies },
  'gl-ES': { interface: glInterface, species: glSpecies },
  'hr-HR': { interface: hrInterface, species: hrSpecies },
  'hu-HU': { interface: huInterface, species: huSpecies },
  'it-IT': { interface: itInterface, species: itSpecies },
  'ja-JP': { interface: jaInterface, species: jaSpecies },
  'lt-LT': { interface: ltInterface, species: ltSpecies },
  'lv-LV': { interface: lvInterface },
  'nl-NL': { interface: nlInterface, species: nlSpecies },
  'pl-PL': { interface: plInterface, species: plSpecies },
  'pt-PT': { interface: ptInterface, species: ptSpecies },
  'ro-RO': { interface: roInterface, species: roSpecies },
  'ru-RU': { interface: ruInterface, species: ruSpecies },
  'sk-SK': { interface: skInterface, species: skSpecies },
  'sl-SI': { interface: slInterface, species: slSpecies },
  'sq-AL': { interface: sqInterface, species: sqSpecies },
  'sr-Latn': { interface: srLatnInterface },
  'sr-RS': { interface: srInterface, species: srSpecies },
  'sv-SE': { interface: svInterface, species: svSpecies },
  'tr-TR': { interface: trInterface, species: trSpecies },
} as const;

export default ionic(tailwind(resources));
