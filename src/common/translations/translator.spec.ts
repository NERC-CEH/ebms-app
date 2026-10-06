import i18n from 'i18next';
import en from './interface/en.json';
import lt from './interface/lt-LT.json';

test('resolves nested JSON translations', async () => {
  const translator = i18n.createInstance();
  await translator.init({
    defaultNS: 'interface',
    resources: {
      en: { interface: en },
      'lt-LT': { interface: lt },
    },
    lng: 'en',
    fallbackLng: 'en',
    returnEmptyString: false,
    keySeparator: '.',
    nsSeparator: false,
  });

  expect(translator.t('common.cancel')).toBe('Cancel');
  expect(translator.t('Back')).toBe('Back');
  expect(translator.t('Please fill in')).toBe('Please fill in');
  expect(translator.t('settings.account.delete')).toBe('Delete account');
  expect(translator.t('settings.account.info')).toBe(
    'You can delete your user account from the system.'
  );
  expect(translator.t('records.uploadingCountRecord', { count: 1 })).toBe(
    'Uploading 1 record'
  );
  expect(translator.t('records.uploadingCountRecord', { count: 2 })).toBe(
    'Uploading 2 records'
  );

  await translator.changeLanguage('lt-LT');
  expect(translator.t('common.cancel')).toBe('Atšaukti');
  expect(translator.t('Back')).toBe('Atgal');
  expect(translator.t('Camera')).toBe('Kamera');
  expect(translator.t('Please fill in')).toBe('Prašome užpildyti');
  expect(translator.t('user.emailTaken')).toBe('Šis el.paštas jau naudojamas');
  expect(translator.t('user.incorrectCredentials')).toBe(
    'Neteisingas prisijungimo vardas arba slaptažodis'
  );
  expect(translator.t('user.unrecognizedEmail')).toBe(
    'netinkamas el.pašto formatas'
  );
  expect(translator.t('survey.changedListOrderingAlphabetical')).toBe(
    'Sąrašo rūšavimas pakeistas į alfabetišką.'
  );
  expect(translator.t('survey.changedListOrderingLastAdded')).toBe(
    'Sąrašo rūšavimas pakeistas į rūšies įvedimo laiką.'
  );
  expect(translator.t('survey.changedListOrderingLastEdited')).toBe(
    'Sąrašas surikiuotas pagal paskutinį redagavimą.'
  );
  expect(translator.t('settings.account.delete')).toBe('Ištrinti paskyrą');
  expect(translator.t('records.uploadingCountRecord', { count: 1 })).toBe(
    'Siunčiama 1 įrašas'
  );
  expect(translator.t('records.uploadingCountRecord', { count: 10 })).toBe(
    'Siunčiama 10 įrašų'
  );
  expect(translator.t('common.identificationFailed')).toBe(
    'Atsiprašome, nepavyko nustatyti šios rūšies.'
  );
});
