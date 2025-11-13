export {
  default as Model,
  type Options as ModelOptions,
  type Data as ModelAttrs,
} from '@flumens/models/dist/Model';
export {
  default as SampleModel,
  type Data as SampleAttrs,
  type Options as SampleOptions,
  type Metadata as SampleMetadata,
  type RemoteConfig,
} from '@flumens/models/dist/Indicia/Sample';
export {
  default as MediaModel,
  type Data as MediaAttrs,
} from '@flumens/models/dist/Indicia/Media';
export {
  default as OccurrenceModel,
  type Data as OccurrenceAttrs,
  type Options as OccurrenceOptions,
  type Metadata as OccurrenceMetadata,
} from '@flumens/models/dist/Indicia/Occurrence';
export {
  default as GroupCollection,
  byGroupMembershipStatus,
} from '@flumens/models/dist/Indicia/GroupCollection';
export {
  default as LocationCollection,
  byLocationType,
  type Options as LocationCollectionOptions,
} from '@flumens/models/dist/Indicia/LocationCollection';
export {
  default as GroupModel,
  type Data as GroupData,
  type LocationData as GroupLocationData,
} from '@flumens/models/dist/Indicia/Group';
export {
  default as LocationModel,
  type Data as LocationData,
  type Options as LocationOptions,
  dtoSchema as locationDtoSchema,
  LocationType,
} from '@flumens/models/dist/Indicia/Location';
export { validateRemoteModel } from '@flumens/models/dist/Indicia/helpers';
export {
  default as DrupalUserModel,
  type Data as DrupalUserModelData,
} from '@flumens/models/dist/Drupal/User';
export { default as Collection } from '@flumens/models/dist/Collection';
export { default as Store } from '@flumens/models/dist/Stores/SQLiteStore';
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
export { default as VirtualList } from '@flumens/tailwind/dist/components/VirtualList';
export {
  default as MenuAttrItemFromModel,
  type MenuProps as MenuAttrItemFromModelMenuProps,
} from '@flumens/ionic/dist/components/MenuAttrItemFromModel';
export { default as UserFeedbackRequest } from '@flumens/ionic/dist/components/UserFeedbackRequest';
export {
  default as MapContainer,
  useMapStyles,
} from '@flumens/tailwind/dist/components/Map/Container';
export { default as MapHeader } from '@flumens/ionic/dist/components/Map/Header';
export { default as CircleMarker } from '@flumens/tailwind/dist/components/Map/Container/LocationMarker/CircleMarker';
export { default as MapSettingsPanel } from '@flumens/ionic/dist/components/Map/SettingsPanel';
export { default as MapDraw } from '@flumens/tailwind/dist/components/Map/Draw';
export * from '@flumens/tailwind/dist/components/Map/utils';
export { default as LongPressFabButton } from '@flumens/ionic/dist/components/LongPressFabButton';
export { useToast, useAlert, useLoader } from '@flumens/ionic/dist/hooks';
export * from '@flumens/utils/dist/image';
export * from '@flumens/utils/dist/errors';
export * from '@flumens/utils/dist/uuid';
export * from '@flumens/utils/dist/date';
// TODO: temp fix
export const isValidDate = (date: string | number | Date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d as any); // eslint-disable-line no-restricted-globals
};

export { options as sentryOptions } from '@flumens/utils/dist/sentry';
export { default as device } from '@flumens/utils/dist/device';
export { default as string } from '@flumens/utils/dist/string';
export * from '@flumens/utils/dist/location';
export {
  default as MigrationManager,
  type Migration,
} from '@flumens/utils/dist/MigrationManager';
export {
  useDisableBackButton,
  useOnBackButton,
  useOnHideModal,
} from '@flumens/ionic/dist/hooks/navigation';
export {
  type default as ElasticSample,
  type Media as ElasticSampleMedia,
} from '@flumens/models/dist/Indicia/ElasticSample.d';
export {
  type default as ElasticOccurrence,
  type Media as ElasticOccurrenceMedia,
} from '@flumens/models/dist/Indicia/ElasticOccurrence.d';

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
  type BlockConf as BlockT,
  type ChoiceValues,
} from '@flumens/tailwind/dist/Survey';
export { default as Block } from '@flumens/tailwind/dist/components/Block';
export {
  default as Checkbox,
  type CheckboxOption,
} from '@flumens/tailwind/dist/components/Checkbox';
export {
  default as TailwindBlockContext,
  defaultContext,
} from '@flumens/tailwind/dist/components/Block/Context';
export { default as InfoBackgroundMessage } from '@flumens/tailwind/dist/components/InfoBackgroundMessage';

export {
  default as useSample,
  withSample,
  SamplesContext,
} from '@flumens/ionic/dist/hooks/useSample';
export { default as useRemoteSample } from '@flumens/ionic/dist/hooks/useRemoteSample';
