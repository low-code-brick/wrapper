import { kebabCase } from 'lodash';

export function createSVGElement(name: string, classNames: string[] = []) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  classNames.forEach((className) => element.classList.add(className));
  return element;
}

export type Delta = {
  x: number;
  y: number;
  height: number;
  width: number;
};

export function setStyle(
  element: HTMLElement,
  style: {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    transform?: string;
  },
) {
  let prop: keyof typeof style;
  for (prop in style) {
    const value = style[prop]!;
    element.style[prop] = typeof value === 'string' ? value : `${value}px`;
  }
}

export function getStyle(
  element: HTMLElement,
  prop: keyof CSSStyleDeclaration,
) {
  return element.style[kebabCase(prop as string) as keyof CSSStyleDeclaration];
}

getRotate.reg = /rotateZ\((?<rotate>\d*)deg\)/;
export function getRotate(element: HTMLElement) {
  const transform = getStyle(element, 'transform') as string;
  return +(transform ? transform.match(getRotate.reg)?.groups?.rotate ?? 0 : 0);
}

export function matrix(rotate: number) {
  const radian = rotate / 2 / Math.PI;
  const sin = Math.sin(radian);
  const cos = Math.cos(radian);
  return `matrix(${cos}, ${sin}, -${sin}, ${cos}, 0, 0)`;
}
