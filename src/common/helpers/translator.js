/* eslint-disable camelcase */
import appModel from 'app_model';
import en from '../translations/en.pot';
import lt_LT from '../translations/lt_LT.po';
import es_ES from '../translations/es_ES.po';
import sv_SE from '../translations/sv_SE.po';

const dictionary = {
  en,
  lt_LT,
  es_ES,
  sv_SE,
};

export const languages = {
  en: 'English',
  lt_LT: 'Lietuvių',
  es_ES: 'Español',
  sv_SE: 'Svenska',
};

export const countries = {
  UK: 'United Kingdom',
  LT: 'Lithuania',
  ES: 'Spain',
  SE: 'Sweden',
};

function translate(key) {
  const language = appModel.get('language');

  const translation = dictionary[language][key];
  if (!translation) {
    window.dic = window.dic || [];
    if (!window.dic.includes(key)) {
      window.dic.push(key);
      console.log(`!new: ${key}`); // todo: remove
      // all='';dic.forEach(word => {all+=`\nmsgid "${word}"\nmsgstr "${word}"\n`})
    }
    return key;
  }

  if (!translation) {
    return key;
  }

  return translation;
}

window.t = translate;

export default translate;
