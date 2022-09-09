import React, { useMemo, ReactNode, useRef, useEffect } from 'react';
import Draggable from '@src/Draggable';
import Rotate from '@src/Rotate';
import Stretch from '@src/Stretch';
import { Provider } from './Context';
import styles from './style.module.less';
import classNames from 'classnames';
import { setStyle } from '@src/utils';
import type { WrapperType } from './Context';

type LibInstances = {
  get: () => any;
};

export type Refs = {
  draggle: LibInstances;
  rotate: LibInstances;
  stretch: LibInstances;
};
export interface WrapperProps extends WrapperType, PlainNode {
  draggable?: boolean;
  rotate?: boolean;
  stretch?: boolean;
  plugins?: ((Component: React.FC, refs: Refs) => React.FC)[];
  absolute?: boolean;
  defaultStyle?: {
    width?: number | string;
    height?: number | string;
    left?: number | string;
    top?: number | string;
  };
}

let _id = 0;

function wrapper(
  plugins: WrapperProps['plugins'] | undefined,
  refs: Refs,
  children: ReactNode,
): React.FC {
  if (!Array.isArray(plugins)) {
    return () => <>{children}</>;
  }
  const Component: React.FC = () => <>{children}</>;

  // @ts-ignore
  return plugins.reduceRight(
    (content, wrapperHoc) => wrapperHoc(content, refs),
    Component,
  );
}

const Wrapper = (props: WrapperProps) => {
  const {
    children,
    className,
    style,
    draggable = true,
    rotate = true,
    stretch = true,
    absolute = true,
    layout = {},
    plugins,
    defaultStyle,
  } = props;
  const identify = useMemo(() => `wrapper-${_id++}`, []);
  const draggleRef = useRef<() => any>();
  const rotateRef = useRef<() => any>();
  const stretchRef = useRef<() => any>();
  const refs = useMemo(
    () => ({
      draggle: {
        get() {
          return draggleRef.current && draggleRef.current();
        },
      },
      rotate: {
        get() {
          return rotateRef.current && rotateRef.current();
        },
      },
      stretch: {
        get() {
          return stretchRef.current && stretchRef.current();
        },
      },
    }),
    [],
  );

  const Content = useMemo<React.FC>(
    () =>
      wrapper(
        plugins,
        refs,
        <div
          className={classNames(
            className,
            `wrapper-container`,
            styles.container,
            identify,
          )}
          style={{
            position: absolute ? 'absolute' : 'relative',
            ...style,
          }}
        >
          <div className={classNames(`wrapper-inner`, styles.inner)}>
            {children}
            {layout.inner && layout.inner(props)}
          </div>
          {draggable && <Draggable ref={draggleRef} refs={refs} />}
          {rotate && <Rotate ref={rotateRef} refs={refs} />}
          {stretch && <Stretch ref={stretchRef} refs={refs} />}
          {layout.default && layout.default(props)}
        </div>,
      ),
    [plugins, className, draggable, children],
  );

  // 初始高度, 宽度, 定位值
  useEffect(() => {
    const wrapper = document.querySelector(`.${identify}`) as HTMLElement;
    if (wrapper == null || defaultStyle == null) return;

    setStyle(wrapper, defaultStyle);
  }, []);

  return (
    <Provider {...props} identify={identify}>
      <Content />
    </Provider>
  );
};

export default Wrapper;
