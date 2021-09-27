import { alert } from '@apps';

const printErrors = ({ errors }) => {
  if (!errors) {
    return null;
  }
  const messageWithTranslation = message => `• ${t(message)}`;
  return errors.map(messageWithTranslation).join('<br/>');
};

function getDeepErrorMessage({ attributes, samples, occurrences }) {
  let missing = '';

  if (attributes) {
    const missingAttributes = printErrors(attributes);
    missing += `<br/>${missingAttributes}<br/>`;
  }

  if (samples) {
    const getDeepErrorSampleMessage = invalids => {
      return getDeepErrorMessage(invalids);
    };
    missing += Object.values(samples)
      .map(getDeepErrorSampleMessage)
      .join('<br/>');
  }

  if (occurrences) {
    const getDeepErrorOccurrenceMessage = invalids => {
      return getDeepErrorMessage(invalids);
    };
    missing += Object.values(occurrences)
      .map(getDeepErrorOccurrenceMessage)
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
        handler: onSaveDraft || (() => null),
      },
    ],
  });
}
