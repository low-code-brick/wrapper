import { useContext, useEffect, useRef, forwardRef } from 'react';
import WrapperContext from '@src/Wrapper/Context';
import classNames from 'classnames';
import { setStyle, getRotate } from '@src/utils';
import { misregistration, setCursor, areaDirection, toRadian } from './core';
import { Pan, Manager } from 'hammerjs';
import styles from './style.module.less';
import type { Delta } from '@src/utils';
import type { Refs } from '@src/Wrapper';

interface StretchProps extends PlainNode {
  refs: Refs;
}

type Translate = {
  x: number;
  y: number;
};

// 鼠标的移动方向
const revMap: Record<number, 1 | -1> = {
  16: 1, // 下
  4: 1, // 右
  8: -1, // 上
  2: -1, // 左
  1: 1, // 原地
};

function getDistance(
  {
    area,
    event,
  }: { area: ReturnType<typeof areaDirection>; event: HammerInput },
  radian: number,
  horizontal = true,
) {
  const methods = [Math.cos, Math.sin];
  if (!horizontal) {
    methods.reverse();
  }
  return area.x * area.y > 0
    ? event.deltaX / Math.abs(methods[0](radian))
    : event.deltaY / Math.abs(methods[1](radian));
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

    const observer = new ResizeObserver(function (entries) {
      // entries.forEach();
    });

    // 拉伸事件
    const managers: InstanceType<typeof Manager>[] = [];
    const lines = ['lineTop', 'lineRight', 'lineBottom', 'lineLeft'];
    const circles = [
      'circleTopLeft',
      'circleBottomRight',
      'circleTopRight',
      'circleBottomLeft',
    ];
    const eles = [...lines, ...circles];
    eles.forEach((tag) => {
      const line = document.querySelector(
        `.${identify} .${styles[tag]}`,
      ) as HTMLElement;
      const mc = new Manager(line);
      managers.push(mc);
      mc.add(new Pan());

      // let rect: DOMRect;
      let position: {
        left: number;
        top: number;
        width: number;
        height: number;
      };
      let rotate = getRotate(wrapper) % 360;

      // 这里没有办法直接获取到 transform 值.
      // 通过监听 resize 来获取.
      observer.observe(wrapper.querySelector(`.${styles[tag]}`)!);

      mc.on('panstart', () => {
        // rect = wrapper.getBoundingClientRect();
        const left = Number.parseFloat(wrapper.style.left);
        const top = Number.parseFloat(wrapper.style.top);
        // const { height, width } = rect; // 这里
        const width = Number.parseFloat(wrapper.style.width);
        const height = Number.parseFloat(wrapper.style.height);
        position = { left, top, width, height };
        rotate = getRotate(wrapper) % 360;
        draggle.get().setPopperVisible(true);

        // 设置鼠标样式, TODO: 移动到外部
        setCursor(tag, wrapper.querySelector(`.${styles[tag]}`)!, rotate);
      });
      mc.on('panmove', (event: HammerInput) => {
        const { left, top, height, width } = position;
        const area = areaDirection(rotate + 45);
        const direction = rotate > 135 && rotate < 315 ? -1 : 1;
        const rev = revMap[event.offsetDirection];
        console.log(direction, event, event.distance);
        const radian = toRadian(rotate);
        let distance: number;
        const lineDistance =
          area.x * area.y > 0
            ? event.deltaX / Math.abs(Math.cos(radian))
            : event.deltaY / Math.abs(Math.sin(radian));

        let delta: Delta;
        let dx: number;
        let translate: Translate;
        let translateA: Translate;
        let translateB: Translate;
        // TODO: 数值保留1位小数
        // TODO: 鼠标样式随旋转变化
        // TODO: 转换为 matrix
        switch (tag) {
          case 'lineBottom':
            distance = getDistance(
              {
                area,
                event,
              },
              radian,
              false,
            );
            translate = misregistration(
              (rev * distance * direction) / 2,
              rotate,
              1,
              true,
            );
            delta = {
              transform: `rotateZ(${rotate}deg) translateX(${
                -rev * translate.x
              }px) translateY(${rev * translate.y}px)`,
              height: height + distance * direction,
            };
            break;
          case 'lineRight':
            distance = getDistance(
              {
                area,
                event,
              },
              radian,
            );
            translate = misregistration(
              (rev * distance * direction) / 2,
              rotate,
            );
            delta = {
              transform: `rotateZ(${rotate}deg) translateX(${
                rev * translate.x
              }px) translateY(${rev * translate.y}px)`,
              width: width + distance * direction,
            };
            break;
          case 'lineLeft':
            distance = getDistance(
              {
                area,
                event,
              },
              radian,
            );
            translate = misregistration(
              (-rev * distance * direction) / 2,
              rotate,
              -1,
            );
            delta = {
              transform: `rotateZ(${rotate}deg) translateX(${
                -rev * translate.x
              }px) translateY(${rev * translate.y}px)`,
              width: width - distance * direction,
            };
            break;
          case 'lineTop':
            distance = getDistance(
              {
                area,
                event,
              },
              radian,
              false,
            );
            translate = misregistration(
              (rev * distance * direction) / 2,
              rotate,
              -1,
              true,
            );
            delta = {
              transform: `rotateZ(${rotate}deg) translateX(${
                rev * translate.x
              }px) translateY(${rev * translate.y}px)`,
              height: height - distance * direction,
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
            translateA = misregistration((rev * event.deltaX) / 2, rotate);
            translateB = misregistration(
              (rev * event.deltaY) / 2,
              rotate,
              1,
              true,
            );
            delta = {
              transform: `rotateZ(${rotate}deg) translateX(${
                -rev * translateB.x + rev * translateA.x
              }px) translateY(${rev * translateB.y + rev * translateA.y}px)`,
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
        // @ts-ignore
        if (delta.width < 0 || delta.height < 0) {
          return;
        }
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

    // 获取不到样式
    // console.log(
    //   'wrappe22222r',
    //   wrapper,
    //   wrapper.style.transform,
    //   window.getComputedStyle(wrapper).transform,
    // );

    // 设置鼠标样式
    // setCursor(
    //   tag,
    //   wrapper.querySelector(`.${styles[tag]}`)!,
    //   rotate,
    // );
    // 监听rotate变化时间, 设置鼠标样式

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
