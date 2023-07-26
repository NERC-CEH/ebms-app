import {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { VariableSizeList as List } from 'react-window';
import { useIonViewDidEnter } from '@ionic/react';

type Props = any;

// eslint-disable-next-line react/no-unstable-nested-components
const VirtualList = forwardRef(
  (
    { itemSize, Item, topPadding = 0, bottomPadding = 0, ...props }: Props,
    ref
  ) => {
    const contentRef = useRef<any>();
    const listRef = useRef<any>();

    const exposeRef = () => listRef.current;
    useImperativeHandle(ref, exposeRef, []);

    const [listHeight, setListHeight] = useState<number>(1); // some positive number

    const setCurrentContentHeight = () => {
      if (contentRef?.current?.clientHeight) {
        setListHeight(contentRef.current.clientHeight);
      }
    };
    useIonViewDidEnter(setCurrentContentHeight); // before mounting the first time list has no height
    useEffect(setCurrentContentHeight, [contentRef.current]);
    const refreshMapOnResize = () => {
      window.addEventListener('ionKeyboardDidHide', setCurrentContentHeight);
      return () => {
        window.removeEventListener(
          'ionKeyboardDidHide',
          setCurrentContentHeight
        );
      };
    };
    useEffect(refreshMapOnResize);

    // eslint-disable-next-line react/no-unstable-nested-components
    const ItemWithPadding = ({ style, ...itemProps }: any) => (
      <Item
        style={{ ...style, top: style.top + topPadding, height: 'auto' }}
        {...itemProps}
      />
    );

    // Add bottom padding
    // eslint-disable-next-line react/no-unstable-nested-components
    const innerElementType = forwardRef(({ style, ...rest }: any, innerRef) => (
      <div
        ref={innerRef}
        style={{
          ...style,
          height: `${parseFloat(style.height) + topPadding + bottomPadding}px`,
        }}
        {...rest}
      />
    ));

    const resetIfItemsChange = () => {
      if (listRef?.current) {
        listRef.current.resetAfterIndex(0);
      }
    };
    useEffect(resetIfItemsChange, [itemSize]);

    return (
      <div style={{ height: '100%' }} ref={contentRef}>
        <List
          ref={listRef}
          height={listHeight}
          itemSize={itemSize}
          innerElementType={bottomPadding ? innerElementType : undefined}
          width="100%"
          {...props}
        >
          {ItemWithPadding}
        </List>
      </div>
    );
  }
);

export default VirtualList;
