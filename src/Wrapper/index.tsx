import React, { useMemo, useRef, useEffect, ReactNode, memo } from 'react';
import Draggable from '@src/Draggable';
import Rotate from '@src/rotate';
import { Provider, Theme } from './Context';
import type { WrapperType } from './Context';
import styles from './style.module.less';
import classNames from 'classnames';

interface WrapperProps extends WrapperType, PlainNode {
  draggable?: boolean;
  rotate?: boolean;
  scale?: boolean;
  plugins?: ((Component: React.FC) => React.FC)[];
  absolute?: boolean;
}

let _id = 0;

function wrapper(
  plugins: WrapperProps['plugins'] | undefined,
  children: ReactNode,
): React.FC {
  if (!Array.isArray(plugins)) {
    return () => <>{children}</>;
  }
  const Component: React.FC = () => <>{children}</>;

  // FIXME:
  // @ts-ignore
  return plugins.reduceRight(
    (content, wrapperHoc) => wrapperHoc(content),
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
    scale = true,
    tooltip = false,
    absolute = true,
    plugins,
  } = props;
  const identify = useMemo(() => `wrapper-${_id++}`, []);
  const Content = useMemo<React.FC>(
    () =>
      wrapper(
        plugins,
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
            {draggable && <Draggable>{children}</Draggable>}
            {rotate && <Rotate />}
          </div>
        </div>,
      ),
    [plugins, className, draggable, children],
  );

  return (
    <Provider {...props} identify={identify}>
      <Content />
    </Provider>
  );
};

export default Wrapper;
