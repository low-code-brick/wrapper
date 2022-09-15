import { useContext, useEffect, useRef, forwardRef } from 'react';
import WrapperContext from '@src/Wrapper/Context';
import classNames from 'classnames';
import { setStyle, getRotate, rotatePoint } from '@src/utils';
import { Pan, Manager } from 'hammerjs';
import styles from './style.module.less';
import type { Delta } from '@src/utils';
import type { Refs } from '@src/Wrapper';

interface StretchProps extends PlainNode {
  refs: Refs;
}

// 16 下 4 右 8 上 2 左 1 原地
const revMap: Record<number, 1 | -1> = {
  1: 1,
  16: 1,
  4: 1,
  8: -1,
  2: -1,
};

function calcTransform(delta: number, rotate: number, rev = 1) {
  delta = rev * delta;
  const translateX =
    delta / 2 - (delta / 2) * Math.cos((rotate / 180) * Math.PI);
  const translateY = (delta / 2) * Math.sin((rotate / 180) * Math.PI);
  return `rotateZ(${rotate}deg) translateX(${rev * translateX}px) translateY(${
    rev * translateY
  }px)`;
}

const Stretch = forwardRef((props: StretchProps, ref) => {
  const {
    refs: { draggle },
  } = props;
  const consume = useContext(WrapperContext);
  const wrapperRef = useRef<HTMLElement | null>();
  const { identify } = consume;

  useEffect(() => {
    // 获取容器
    const wrapper = (wrapperRef.current = document.querySelector(
      `.${identify}`,
    ) as HTMLElement);
    if (wrapper == null) return;

    // 拉伸事件
    const managers: InstanceType<typeof Manager>[] = [];
    const lines = ['lineTop', 'lineRight', 'lineBottom', 'lineLeft'];
    [
      ...lines,
      'circleTopLeft',
      'circleBottomRight',
      'circleTopRight',
      'circleBottomLeft',
    ].forEach((direction) => {
      const line = document.querySelector(
        `.${identify} .${styles[direction]}`,
      ) as HTMLElement;
      const mc = new Manager(line);
      managers.push(mc);
      mc.add(new Pan());

      let rect: DOMRect;
      let position: {
        left: number;
        top: number;
        width: number;
        height: number;
      };
      let rotate = 0;
      let orignCenter = { x: 0, y: 0 };

      mc.on('panstart', () => {
        rect = wrapper.getBoundingClientRect();
        const left = Number.parseFloat(wrapper.style.left);
        const top = Number.parseFloat(wrapper.style.top);
        // const { height, width } = rect; // 这里
        const width = Number.parseFloat(wrapper.style.width);
        const height = Number.parseFloat(wrapper.style.height);
        position = { left, top, width, height };
        rotate = getRotate(wrapper) % 360;
        draggle.get().setPopperVisible(true);
      });
      mc.on('panmove', (event: HammerInput) => {
        // const { height, width } = rect;
        const { left, top, height, width } = position;
        const rev = revMap[event.offsetDirection];
        console.log(rev, Math.sin((rotate / 180) * Math.PI), '====');
        // const { srcEvent } = event;
        // const lineQuadrant = Math.floor(((rotate + 45) % 360) / 90);
        // console.log(rotate, lineQuadrant, lines[(1 + lineQuadrant) % 4]);
        // console.log(event.angle);
        // 16 下 4 右 8 上 2 左 1 原地
        // console.log('xxxxxxxxx', event.deltaX, event.direction);

        let delta: Delta;
        // const translateX =
        //   event.deltaX / 2 -
        //   (event.deltaX / 2) * Math.cos((30 / 180) * Math.PI);
        // const translateY = (event.deltaX / 2) * Math.sin((30 / 180) * Math.PI);
        let dx: number;
        let translateX: number;
        let translateY: number;
        switch (direction) {
          case 'lineBottom':
            dx = rev * event.deltaY;
            translateX = (dx / 2) * Math.sin((rotate / 180) * Math.PI);
            translateY = dx / 2 - (dx / 2) * Math.cos((rotate / 180) * Math.PI);
            delta = {
              transform: `rotateZ(${rotate}deg) translateX(${
                -rev * translateX
              }px) translateY(${rev * translateY}px)`,
              height: height + event.deltaY,
            };
            break;
          case 'lineRight':
            delta = {
              // transform: `rotateZ(${rotate}deg) translateX(${translateX}px) translateY(${translateY}px)`,
              transform: calcTransform(event.deltaX, rotate, rev),
              width: width + event.deltaX,
            };
            break;
          case 'lineLeft':
            dx = rev * event.deltaX;
            translateX = dx / 2 + (dx / 2) * Math.cos((rotate / 180) * Math.PI);
            translateY = (dx / 2) * Math.sin((rotate / 180) * Math.PI);
            delta = {
              transform: `rotateZ(${rotate}deg) translateX(${
                -rev * translateX
              }px) translateY(${rev * translateY}px)`,
              // transform: calcTransform(event.deltaX, rotate, rev),
              width: width + event.deltaX,
            };
            break;
          case 'lineTop':
            dx = rev * event.deltaY;
            translateX = (dx / 2) * Math.sin((rotate / 180) * Math.PI);
            translateY = dx / 2 + (dx / 2) * Math.cos((rotate / 180) * Math.PI);
            delta = {
              transform: `rotateZ(${rotate}deg) translateX(${
                rev * translateX
              }px) translateY(${rev * translateY}px)`,
              // transform: calcTransform(event.deltaY, rotate, rev),
              height: height - event.deltaY,
            };
            break;
          case 'circleTopLeft':
            delta = {
              width: width - event.deltaX,
              left: left + event.deltaX,
              height: height - event.deltaY,
              top: top + event.deltaY,
            };
            break;
          case 'circleBottomRight':
            delta = {
              transform: `rotateZ(${rotate}deg) translateX(${event.deltaX}px) translateY(${event.deltaY}px)`,
              width: width + event.deltaX,
              height: height + event.deltaY,
            };
            break;
          case 'circleTopRight':
            delta = {
              top: top + event.deltaY,
              width: width + event.deltaX,
              height: height - event.deltaY,
            };
            break;
          case 'circleBottomLeft':
            delta = {
              left: left + event.deltaX,
              width: width - event.deltaX,
              height: height + event.deltaY,
            };
            break;
        }

        // TODO: 优化动画, 操作DOM不该在这里
        // TODO: 中心点的坐标计算
        // @ts-ignore
        setStyle(wrapper, delta);
        draggle.get().popper?.update();
      });

      mc.on('panend', () => {
        draggle.get().setPopperVisible(false);
      });

      // 自定义事件
      ['panStart', 'panMove', 'panEnd'].forEach((eventName) => {
        // @ts-ignore
        const event = consume[eventName];
        if (event) {
          mc.on(eventName.toLowerCase(), event);
        }
      });
    });

    return () => {
      managers.forEach((o) => o.destroy());
    };
  }, []);

  return (
    <>
      <div className={classNames('line', styles.line, styles.lineTop)}>
        <div
          className={classNames(
            'circle',
            styles.circle,
            styles.circleTopCenter,
          )}
        />
      </div>
      <div className={classNames('line', styles.line, styles.lineRight)}>
        <div
          className={classNames(
            'circle',
            styles.circle,
            styles.circleRightCenter,
          )}
        />
      </div>
      <div className={classNames('line', styles.line, styles.lineBottom)}>
        <div
          className={classNames(
            'circle',
            styles.circle,
            styles.circleBottomCenter,
          )}
        />
      </div>
      <div className={classNames('line', styles.line, styles.lineLeft)}>
        <div
          className={classNames(
            'circle',
            styles.circle,
            styles.circleLeftCenter,
          )}
        />
      </div>
      <div
        className={classNames('circle', styles.circle, styles.circleTopLeft)}
      />
      <div
        className={classNames('circle', styles.circle, styles.circleTopRight)}
      />
      <div
        className={classNames('circle', styles.circle, styles.circleBottomLeft)}
      />
      <div
        className={classNames(
          'circle',
          styles.circle,
          styles.circleBottomRight,
        )}
      />
    </>
  );
});

export default Stretch;
