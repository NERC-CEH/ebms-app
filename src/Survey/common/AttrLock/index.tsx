import { cloneElement, ReactElement, useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import {
  chevronForwardOutline,
  lockClosedOutline,
  lockOpenOutline,
} from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { MenuAttrItem, MenuAttrItemFromModel, useToast } from '@flumens';
import {
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  isPlatform,
} from '@ionic/react';
import Sample from 'common/models/sample';
import './styles.scss';

type AttrLockProps = {
  sample: Sample;
  taxonGroup: string | number | null | undefined;
  model: 'smp' | 'occ';
  attr: string;
  value: unknown;
  onLock?: (
    taxonGroup: string | number | null | undefined,
    model: 'smp' | 'occ',
    attr: string,
    value: unknown
  ) => void;
  onUnlock?: () => void;
  children: ReactElement<{ detailIcon?: string }>;
};

const AttrLock = ({
  sample,
  taxonGroup,
  model,
  attr,
  value,
  onLock,
  onUnlock,
  children,
}: AttrLockProps) => {
  const toast = useToast();
  const slider = useRef<HTMLIonItemSlidingElement>(null);
  const hasValue = value !== undefined && value !== null && value !== '';
  const hasLock = sample.locks.isLocked(taxonGroup, model, attr);
  const isLocked = sample.locks.isLocked(taxonGroup, model, attr, value);
  const wasLocked = useRef(isLocked);

  useEffect(() => {
    // An explicit unlock must not be mistaken for an edited locked value.
    if (!wasLocked.current || isLocked || !hasLock) {
      wasLocked.current = isLocked;
      return;
    }

    if (hasValue) sample.locks.set(taxonGroup, model, attr, value);
    else sample.locks.unset(taxonGroup, model, attr);
    wasLocked.current = hasValue;
  }, [attr, hasLock, hasValue, isLocked, model, sample, taxonGroup, value]);

  const toggleLock = async () => {
    await slider.current?.close();
    if (isPlatform('hybrid')) Haptics.impact({ style: ImpactStyle.Light });

    if (isLocked) {
      wasLocked.current = false;
      await sample.locks.unset(taxonGroup, model, attr);
      onUnlock?.();
      return;
    }

    wasLocked.current = true;
    onLock
      ? onLock(taxonGroup, model, attr, value)
      : await sample.locks.set(taxonGroup, model, attr, value);
    toast.success('survey.attributeValueWas', {
      color: 'success',
      position: 'bottom',
    });
  };

  const detailIcon = isLocked ? lockClosedOutline : chevronForwardOutline;
  const child =
    children.type === IonItem ||
    children.type === MenuAttrItem ||
    children.type === MenuAttrItemFromModel ? (
      cloneElement(children, { detailIcon })
    ) : (
      <IonItem
        className="[--padding-start:0px] [--inner-padding-end:0px] w-full [&>*]:w-full"
        detailIcon={detailIcon}
      >
        {children}
      </IonItem>
    );

  return (
    <IonItemSliding
      ref={slider}
      className={`attr-lock${isLocked ? ' locked' : ''}`}
      disabled={!hasValue || sample.isDisabled}
    >
      {child}
      <IonItemOptions side="end">
        <IonItemOption
          aria-label={isLocked ? 'Unlock attribute' : 'Lock attribute'}
          color="success"
          onClick={toggleLock}
        >
          <IonIcon icon={isLocked ? lockOpenOutline : lockClosedOutline} />
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default observer(AttrLock);
