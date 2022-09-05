import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useContext,
  useMemo,
  useState,
} from 'react';
import WrapperContext from '@src/Wrapper/Context';
import Draggabilly from 'draggabilly';
import { createPopper } from '@popperjs/core';
import classNames from 'classnames';
import styles from './style.module.less';
import type { ReactNode } from 'react';
import type { Instance as Popper } from '@popperjs/core';

interface DraggableProps extends PlainNode {
  axis?: 'x' | 'y';
  containment?: ElementLike | boolean;
  grid?: [number, number];
  handle?: ElementLike | ElementLike[];
}

enum Theme {
  dark = 'dark',
  light = 'light',
}

enum Placement {
  right = 'right',
  left = 'left',
  bottom = 'bottom',
  top = 'top',
}

export interface Tooltip {
  theme?: Theme;
  placement?: Placement;
  title: ReactNode;
}

/**
 * @document https://draggabilly.desandro.com/
 */
const Draggable = forwardRef((props: DraggableProps, ref) => {
  const { className, style, children, ...otherProps } = props;
  const { container, identify, tooltip } = useContext(WrapperContext);
  const [visible, setVisible] = useState(false);
  const draggieRef = useRef();
  const popperRef = useRef<Popper>();

  const tooltipIsReactNode = useMemo(
    () => React.isValidElement(tooltip),
    [tooltip],
  );
  const theme = useMemo<Theme>(() => {
    if (tooltipIsReactNode) {
      return Theme.dark;
    }
    return tooltip ? tooltip.theme ?? Theme.dark : Theme.dark;
  }, [tooltip, tooltipIsReactNode]);
  const placement = useMemo<Placement>(() => {
    if (tooltipIsReactNode) {
      return Placement.right;
    }
    return tooltip ? tooltip.placement ?? Placement.right : Placement.right;
  }, [tooltip, tooltipIsReactNode]);

  useImperativeHandle(
    ref,
    () => () => ({
      draggie: draggieRef.current,
      popper: popperRef.current,
    }),
    [],
  );

  // draggabilly
  useEffect(() => {
    const wrapper = document.querySelector(`.wrapper-0 `);
    if (wrapper == null) {
      console.warn(`draggabilly 初始化失败.`);
      return;
    }

    const draggie = new Draggabilly(`.${identify}`, {
      containment: container,
      ...otherProps,
    });

    const parentElement = wrapper.parentElement as HTMLElement;
    const { left: parentLeft, top: parentTop } =
      parentElement.getBoundingClientRect();

    draggie.on('dragMove', (/* event, pointer, moveVector */) => {
      const { left, top } = wrapper.getBoundingClientRect();
      console.log(left - parentLeft, top - parentTop);
    });

    return () => {
      draggie.destroy();
      draggieRef.current = undefined;
    };
  }, []);

  // tooltip
  useEffect(() => {
    let popper: Popper;
    const destroy = () => {
      popper?.destroy();
      popperRef.current = undefined;
    };

    if (!tooltip) return destroy;

    if (popperRef.current) {
      popper = popperRef.current;
      popper.update();
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
              offset: [0, 8],
            },
          },
        ],
      },
    );

    return destroy;
  }, []);

  return (
    <>
      {tooltip && (
        <div
          className={classNames(styles.tooltip, theme && styles[theme])}
          role="tooltip"
        >
          <>
            {tooltipIsReactNode ? tooltip : tooltip.title}
            <div className={styles.arrow} data-popper-arrow></div>
          </>
        </div>
      )}
      {children}
    </>
  );
});

export default Draggable;
