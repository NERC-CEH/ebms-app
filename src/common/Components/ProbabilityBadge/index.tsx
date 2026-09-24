import { MouseEvent, useState } from 'react';
import clsx from 'clsx';
import { Trans as T } from 'react-i18next';
import { IonContent, IonPopover } from '@ionic/react';
import Badge from './Badge';

type Props = {
  probability?: number;
  className?: string;
  showInfo?: boolean;
};

const ProbabilityBadge = ({ probability, className, showInfo }: Props) => {
  const [infoState, setInfoState] = useState<{
    showInfo: boolean;
    event?: MouseEvent;
  }>({ showInfo: false });

  const hasProbability = Number.isFinite(probability);
  const normalisedProbability = probability! < 0.01 ? 0.01 : probability; // round the very small probabilities to 1%

  const onShowInfo = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setInfoState({ showInfo: true, event: e });
  };

  const hideInfo = () => setInfoState({ showInfo: false, event: undefined });

  return (
    <>
      <div
        className={clsx('flex flex-col justify-center items-center', className)}
      >
        <Badge
          probability={probability}
          onClick={showInfo ? onShowInfo : undefined}
        />

        {showInfo && hasProbability && (
          <span className="text-xs text-neutral-500">
            {Number(normalisedProbability! * 100).toFixed(0)}%
          </span>
        )}
      </div>

      <IonPopover
        className="info-popover [--width:200px]"
        event={infoState.event}
        isOpen={infoState.showInfo}
        onDidDismiss={hideInfo}
        size="auto"
      >
        <IonContent className="[--background:white] [--overflow:hidden]">
          <div className="pl-2 [&>*]:my-4 [&>*]:flex [&>*]:items-center [&>*]:gap-2">
            <div>
              <Badge probability={1} /> <T>common.highConfidence</T>
            </div>
            <div>
              <Badge probability={0.5} /> <T>common.mediumConfidence</T>
            </div>
            <div>
              <Badge probability={0.2} />
              <T>common.lowConfidence</T>
            </div>
          </div>
        </IonContent>
      </IonPopover>
    </>
  );
};

export default ProbabilityBadge;
