export { boolToWarehouseValue } from '@flumens/ionic/dist/models/Indicia/helpers';
export {
  default as Model,
  type Options as ModelOptions,
  type Metadata as ModelMetadata,
  type Attrs as ModelAttrs,
} from '@flumens/ionic/dist/models/Model';
export {
  default as Sample,
  type Attrs as SampleAttrs,
  type Options as SampleOptions,
  type Metadata as SampleMetadata,
  type RemoteConfig,
} from '@flumens/ionic/dist/models/Indicia/Sample';
export {
  default as Media,
  type Attrs as MediaAttrs,
} from '@flumens/ionic/dist/models/Indicia/Media';
export {
  default as Occurrence,
  type Attrs as OccurrenceAttrs,
  type Options as OccurrenceOptions,
  type Metadata as OccurrenceMetadata,
} from '@flumens/ionic/dist/models/Indicia/Occurrence';
export { validateRemoteModel } from '@flumens/ionic/dist/models/Indicia/helpers';
export {
  default as DrupalUserModel,
  type Attrs as DrupalUserModelAttrs,
} from '@flumens/ionic/dist/models/DrupalUserModel';
export { default as Collection } from '@flumens/ionic/dist/models/Collection';
export { default as Store } from '@flumens/ionic/dist/models/Store';
export { default as initStoredSamples } from '@flumens/ionic/dist/models/initStoredSamples';
export { default as Page } from '@flumens/ionic/dist/components/Page';
export {
  default as RouteWithModels,
  getModels as getModelsFromRoute,
} from '@flumens/ionic/dist/components/RouteWithModels';
export { default as Main } from '@flumens/ionic/dist/components/Main';
export { default as Header } from '@flumens/ionic/dist/components/Header';
export { default as Collapse } from '@flumens/ionic/dist/components/Collapse';
export { default as Attr } from '@flumens/ionic/dist/components/Attr';
export {
  default as AttrPage,
  type Props as PageProps,
  type AttrPropsExtended,
} from '@flumens/ionic/dist/components/AttrPage';
export { default as ModelValidationMessage } from '@flumens/ionic/dist/components/ModelValidationMessage';
export { default as ImageWithBackground } from '@flumens/ionic/dist/components/ImageWithBackground';
export { default as Gallery } from '@flumens/ionic/dist/components/Gallery';
export { default as ModalHeader } from '@flumens/ionic/dist/components/ModalHeader';
export { default as Section } from '@flumens/ionic/dist/components/Section';
export { default as PhotoPicker } from '@flumens/ionic/dist/components/PhotoPicker';
export { default as MenuAttrItem } from '@flumens/ionic/dist/components/MenuAttrItem';
export { default as VirtualList } from '@flumens/ionic/dist/components/VirtualList';
export {
  default as MenuAttrItemFromModel,
  type MenuProps as MenuAttrItemFromModelMenuProps,
} from '@flumens/ionic/dist/components/MenuAttrItemFromModel';
export { default as UserFeedbackRequest } from '@flumens/ionic/dist/components/UserFeedbackRequest';
export {
  default as MapContainer,
  useMapStyles,
} from '@flumens/ionic/dist/components/Map/Container';
export { default as MapHeader } from '@flumens/ionic/dist/components/Map/Header';
export { default as CircleMarker } from '@flumens/ionic/dist/components/Map/Container/LocationMarker/CircleMarker';
export { default as MapSettingsPanel } from '@flumens/ionic/dist/components/Map/SettingsPanel';
export { default as MapDraw } from '@flumens/ionic/dist/components/Map/Draw';
export * from '@flumens/ionic/dist/components/Map/utils';
export { default as LongPressFabButton } from '@flumens/ionic/dist/components/LongPressFabButton';
export { useToast, useAlert, useLoader } from '@flumens/ionic/dist/hooks';
export * from '@flumens/ionic/dist/utils/image';
export * from '@flumens/ionic/dist/utils/errors';
export { default as UUID, hashCode } from '@flumens/ionic/dist/utils/uuid';

export * from '@flumens/ionic/dist/utils/date';
// TODO: temp fix
export const isValidDate = (date: string | number | Date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d as any); // eslint-disable-line no-restricted-globals
};

export { options as sentryOptions } from '@flumens/ionic/dist/utils/sentry';
export { default as device } from '@flumens/ionic/dist/utils/device';
export { default as string } from '@flumens/ionic/dist/utils/string';
export {
  type Location,
  prettyPrintLocation,
  updateModelLocation,
  normalizeCoords,
  isValidLocation,
} from '@flumens/ionic/dist/utils/location';
export {
  useDisableBackButton,
  useOnBackButton,
  useOnHideModal,
} from '@flumens/ionic/dist/hooks/navigation';
export {
  type default as ElasticSample,
  type Media as ElasticSampleMedia,
} from '@flumens/ionic/dist/models/Indicia/ElasticSample.d';
export {
  type default as ElasticOccurrence,
  type Media as ElasticOccurrenceMedia,
} from '@flumens/ionic/dist/models/Indicia/ElasticOccurrence.d';

export {
  default as Input,
  type Props as InputProps,
} from '@flumens/tailwind/dist/components/Input';
export { type RadioOption } from '@flumens/tailwind/dist/components/Radio';
export { default as Button } from '@flumens/tailwind/dist/components/Button';
export { default as Badge } from '@flumens/tailwind/dist/components/Badge';
export { default as NumberInput } from '@flumens/tailwind/dist/components/NumberInput';
export { default as RadioInput } from '@flumens/tailwind/dist/components/Radio';
export { default as Toggle } from '@flumens/tailwind/dist/components/Switch';
export {
  default as InfoMessage,
  type Props as InfoMessageProps,
} from '@flumens/tailwind/dist/components/InfoMessage';
export {
  default as TailwindContext,
  type ContextValue as TailwindContextValue,
} from '@flumens/tailwind/dist/components/Context';
export {
  type Block as BlockT,
  type ChoiceValues,
} from '@flumens/tailwind/dist/Survey';
export { default as Block } from '@flumens/tailwind/dist/components/Block';
export {
  default as TailwindBlockContext,
  defaultContext,
} from '@flumens/tailwind/dist/components/Block/Context';
export { default as InfoBackgroundMessage } from '@flumens/tailwind/dist/components/InfoBackgroundMessage';
