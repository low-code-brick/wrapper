import styles from './style.module.less';

export function misregistration(
  distance: number,
  rotate: number,
  direction: 1 | -1 = 1,
  reverse?: boolean,
) {
  rotate = toRadian(rotate);
  const y = distance * Math.sin(rotate);
  const x = distance * (1 - direction * Math.cos(rotate));
  return reverse
    ? {
        x: y,
        y: x,
      }
    : { x, y };
}

export function toRadian(rotate: number) {
  return (rotate / 180) * Math.PI;
}

// export function areaDeg(rotate) {
//   rotate = toRadian(rotate);
//   const sin = Math.sin(rotate);
//   const cos = Math.cos(rotate);
//   console.log(sin, cos)
//   if (sin > 0 && cos > 0) {
//     return 1;
//   }
//   if (sin < 0 && cos > 0) {
//     return 4;
//   }
//   if (sin < 0 && cos < 0) {
//     return 3;
//   }
//   if (sin > 0 && cos < 0) {
//     return 2;
//   }
// }

// 区间方向, 用于区分象限
export function areaDirection(rotate: number) {
  rotate = toRadian(rotate);
  const sin = Math.sin(rotate) > 0 ? 1 : -1;
  const cos = Math.cos(rotate) > 0 ? 1 : -1;
  return {
    x: sin,
    y: cos,
  };
}

export function setCursor(
  targetClassName: string,
  target: HTMLElement,
  rotate: number,
) {
  const areaDirection = Math.cos((rotate / 180) * Math.PI);
  // console.log('areaDirection', areaDirection, targetClassName, rotate);
  target.classList.remove(styles.ns);
  target.classList.remove(styles.ew);
  target.classList.remove(styles.nwse);
  target.classList.remove(styles.nesw);
  switch (targetClassName) {
    case 'lineBottom':
      target.classList.add(areaDirection > 0 ? styles.ns : styles.ew);
      break;
    case 'lineRight':
      target.classList.add(areaDirection < 0 ? styles.ns : styles.ew);
      break;
    case 'lineLeft':
      target.classList.add(areaDirection < 0 ? styles.ns : styles.ew);
      break;
    case 'lineTop':
      target.classList.add(areaDirection > 0 ? styles.ns : styles.ew);
      break;
    case 'circleTopLeft':
      target.classList.add(areaDirection < 0 ? styles.nesw : styles.nwse);
      break;
    case 'circleBottomRight':
      target.classList.add(areaDirection < 0 ? styles.nesw : styles.nwse);
      break;
    case 'circleTopRight':
      target.classList.add(areaDirection > 0 ? styles.nesw : styles.nwse);
      break;
    case 'circleBottomLeft':
      target.classList.add(areaDirection > 0 ? styles.nesw : styles.nwse);
      break;
  }
}

export function getDistance(
  {
    area,
    event,
    userDistance,
  }: {
    area: ReturnType<typeof areaDirection>;
    event: HammerInput;
    userDistance?: number;
  },
  radian: number,
  horizontal = true,
) {
  // if (userDistance) {
  //   return area.x * area.y > 0
  //     ? event.deltaX
  //     : event.deltaY;
  // }

  const methods = [Math.cos, Math.sin];
  if (!horizontal) {
    methods.reverse();
  }

  return area.x * area.y > 0
    ? event.deltaX / Math.abs(methods[0](radian))
    : event.deltaY / Math.abs(methods[1](radian));
}

type Direction = 1 | -1;
// 鼠标的移动方向
const revMap: Record<number, Direction> = {
  16: 1, // 下
  4: 1, // 右
  8: -1, // 上
  2: -1, // 左
  1: 1, // 原地
};

export function getRectChange(
  event: HammerInput,
  rotate: number,
  [vOrH = true, elDirection = 1, reverse = false]: [
    boolean,
    Direction,
    boolean,
  ],
  [x, y, t = 1]: [Direction, Direction, Direction?],
  userDistance?: number,
) {
  const radian = toRadian(rotate);
  const area = areaDirection(rotate + 45);
  const direction = rotate > 135 && rotate < 315 ? -1 : 1;
  const rev = revMap[event.offsetDirection];

  const distance = getDistance(
    {
      area,
      event,
      userDistance,
    },
    radian,
    vOrH,
  );
  const translate = misregistration(
    (t * rev * distance * direction) / 2,
    rotate,
    elDirection,
    reverse,
  );
  return {
    distance: distance * direction,
    translate,
    rotate,
    direction,
    x: x * rev * translate.x,
    y: y * rev * translate.y,
  };
}

export function toTransform(translate: ReturnType<typeof getRectChange>) {
  const { rotate, x, y } = translate;
  return `rotateZ(${rotate}deg) translateX(${x}px) translateY(${y}px)`;
}

export function mergeTransform(
  translateA: ReturnType<typeof getRectChange>,
  translateB: ReturnType<typeof getRectChange>,
) {
  const { x: ax, y: ay, rotate } = translateA;
  const { x: bx, y: by } = translateB;
  return `rotateZ(${rotate}deg) translateX(${ax + bx}px) translateY(${
    ay + by
  }px)`;
}
