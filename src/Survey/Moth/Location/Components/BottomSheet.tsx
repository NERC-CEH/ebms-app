import React, { FC } from 'react';
import Sheet, { SheetRef } from 'react-modal-sheet';

const BottomSheet: FC = () => {
  const SNAP_POSITIONS = [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
  const DEFAULT_SNAP_POSITION = SNAP_POSITIONS.length - 1;

  const ref = React.useRef<SheetRef>();
  const snapTo = (i: number) => ref.current?.snapTo(i);
  const onClose = () => () => snapTo;

  return (
    <>
      <Sheet
        ref={ref}
        isOpen
        snapPoints={SNAP_POSITIONS}
        initialSnap={DEFAULT_SNAP_POSITION}
        onClose={onClose}
      >
        <Sheet.Container>
          <Sheet.Header />
          <Sheet.Content />
        </Sheet.Container>
      </Sheet>
    </>
  );
};

export default BottomSheet;
