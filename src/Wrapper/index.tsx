import { useMemo, useRef, useEffect, ReactNode } from 'react';
import Draggable from '../Draggable';
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
): ReactNode {
  if (!Array.isArray(plugins)) {
    return children;
  }

  // @ts-ignore
  return plugins.reduce((content, hoc) => {
    return hoc(content);
  }, children);
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

  return (
    <Provider {...props} identify={identify}>
      {wrapper(
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
          </div>
        </div>,
      )}
    </Provider>
  );
};

export default Wrapper;
