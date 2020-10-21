import { alert } from '@apps';

const printErrors = ({ errors }) => {
  if (!errors) {
    return null;
  }
  return errors.map(message => `• ${t(message)}`).join('<br/>');
};

function getDeepErrorMessage({ attributes, samples, occurrences }) {
  let missing = '';

  if (attributes) {
    const missingAttributes = printErrors(attributes);
    missing += `<br/>${missingAttributes}<br/>`;
  }

  if (samples) {
    missing += Object.values(samples)
      .map(invalids => {
        return getDeepErrorMessage(invalids);
      })
      .join('<br/>');
  }

  if (occurrences) {
    missing += Object.values(occurrences)
      .map(invalids => {
        return getDeepErrorMessage(invalids);
      })
      .join('<br/>');
  }

  return missing;
}

export default function showInvalidsMessage(invalids, onSaveDraft) {
  const message = getDeepErrorMessage(invalids);

  alert({
    header: t('Survey incomplete'),
    message,
    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
      },
      {
        text: t('Save Draft'),
        cssClass: 'secondary',
        handler: onSaveDraft || (() => {}),
      },
    ],
  });
}
