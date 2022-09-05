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
  plugins?: ((children: ReactNode) => void)[];
}

let _id = 0;

function wrapper(
  plugins: WrapperProps['plugins'] | undefined,
  children: ReactNode,
): React.FC {
  if (!Array.isArray(plugins)) {
    return () => <>{children}</>;
  }

  // @ts-ignore
  return plugins.reduce((content, hoc) => hoc(content), children);
}

const Wrapper = (props: WrapperProps) => {
  const {
    children,
    className,
    style,
    // TODO: 配置
    draggable = true,
    rotate = true,
    scale = true,
    tooltip = false,
    plugins,
  } = props;
  const identify = useMemo(() => `wrapper-${_id++}`, []);
  console.log(123);
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
          style={style}
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
