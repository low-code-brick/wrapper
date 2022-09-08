import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react';
import WrapperContext from '@src/Wrapper/Context';
import Draggabilly from 'draggabilly';
import { createPopper } from '@popperjs/core';
import classNames from 'classnames';
import styles from './style.module.less';
import { delay, merge } from 'lodash';
import type { ReactNode } from 'react';
import type { Instance as Popper, Placement } from '@popperjs/core';
import type { Refs } from '@src/Wrapper';

interface DraggableProps extends PlainNode {
  axis?: 'x' | 'y';
  containment?: ElementLike | boolean;
  grid?: [number, number];
  handle?: ElementLike | ElementLike[];
  refs: Refs;
}

enum Theme {
  dark = 'dark',
  light = 'light',
}

export interface Tooltip {
  title: ReactNode;
  theme?: Theme;
  placement?: Placement;
  modifiers?: any[];
  delay?: number;
}

export enum Events {
  dragStart = 'dragStart',
  dragMove = 'dragMove',
  dragEnd = 'dragEnd',
  pointerDown = 'pointerDown',
  pointerMove = 'pointerMove',
  pointerUp = 'pointerUp',
}

type Options = Required<Pick<Tooltip, 'theme' | 'placement' | 'delay'>>;

const events = Object.keys(Events);

const defaultOptions: Options = {
  theme: Theme.dark,
  placement: 'right',
  delay: 300,
};

/**
 * @document https://draggabilly.desandro.com/
 * @document https://popper.js.org/
 */
const Draggable = forwardRef((props: DraggableProps, ref) => {
  const { className, style, children, ...otherProps } = props;
  const consume = useContext(WrapperContext);
  const { container, identify, tooltip } = consume;
  const [visible, _setVisible] = useState(false);
  const draggieRef = useRef();
  const popperRef = useRef<Popper>();
  const popperEleRef = useRef<HTMLDivElement>(null);

  const setVisible = useCallback((value: boolean) => {
    if (popperEleRef.current == null) return;
    const { classList } = popperEleRef.current;
    if (value) {
      _setVisible(true);
      classList.remove(styles.fadeOut);
    } else {
      delay(_setVisible, delayTime, false);
      classList.add(styles.fadeOut);
    }
  }, []);

  const tooltipIsReactNode = useMemo(
    () => React.isValidElement(tooltip),
    [tooltip],
  );
  const {
    theme,
    placement,
    delay: delayTime,
  } = useMemo<Options>(() => {
    if (tooltipIsReactNode || tooltip === false) {
      return merge({}, defaultOptions);
    }
    return merge({}, defaultOptions, {
      theme: tooltip?.theme,
      placement: tooltip?.placement,
      delay: tooltip?.delay,
    });
  }, [tooltip, tooltipIsReactNode]);

  useImperativeHandle(
    ref,
    () => () => ({
      draggie: draggieRef.current,
      popper: popperRef.current,
      setPopperVisible: setVisible,
    }),
    [],
  );

  // draggabilly
  useEffect(() => {
    const wrapper = document.querySelector(`.${identify}`);
    if (wrapper == null) return;

    const draggie = (draggieRef.current = new Draggabilly(wrapper, {
      containment: container,
      handle: `.${identify} .wrapper-inner`,
      ...otherProps,
    }));

    // 拖动显示
    const open = () => {
      setVisible(true);
    };
    const close = () => {
      setVisible(false);
    };
    draggie.on(Events.dragMove, open);
    draggie.on(Events.dragEnd, close);

    // 注册用户事件
    events.forEach((eventName) => {
      // @ts-ignore
      const event = consume[eventName];
      event && draggie.on(eventName, event);
    });

    return () => {
      draggie.destroy();
      draggieRef.current = undefined;
    };
  }, []);

  // tooltip
  useEffect(() => {
    if (!tooltip) return;

    let popper: Popper;
    const destroy = () => {
      popper?.destroy();
      popperRef.current = undefined;
    };

    if (popperRef.current) {
      return destroy;
    }
    const popcornEle = document.querySelector(`.${identify}`);
    const tooltipEle = document.querySelector(
      `.${identify} .${styles.tooltip}`,
    );

    if (popcornEle == null || tooltipEle == null) return;

    popper = popperRef.current = createPopper(
      popcornEle,
      tooltipEle as HTMLElement,
      {
        placement,
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 7],
            },
          },
          ...(typeof tooltip === 'object' ? tooltip.modifiers ?? [] : []),
        ],
      },
    );

    return destroy;
  }, []);

  useEffect(() => {
    popperRef.current && popperRef.current.update();
  }, [visible]);

  return (
    <>
      {tooltip && (
        <div
          ref={popperEleRef}
          className={classNames(styles.tooltip, theme && styles[theme])}
          role="tooltip"
          style={{
            display: visible ? 'block' : 'none',
            animationDuration: `${delayTime}ms`,
          }}
        >
          <>
            {visible && tooltipIsReactNode ? tooltip : tooltip.title}
            <div className={styles.arrow} data-popper-arrow></div>
          </>
        </div>
      )}
      {children}
    </>
  );
});

export default Draggable;
