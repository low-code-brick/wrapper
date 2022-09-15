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
  console.log('areaDirection', areaDirection, targetClassName, rotate);
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
