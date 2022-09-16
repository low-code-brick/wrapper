import { kebabCase } from 'lodash';

export function createSVGElement(name: string, classNames: string[] = []) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  classNames.forEach((className) => element.classList.add(className));
  return element;
}

export type Delta = {
  height?: number | string;
  width?: number | string;
  left?: number | string;
  top?: number | string;
  transform?: string;
};

export function setStyle(wrapper: HTMLElement, delta: Delta) {
  let prop: keyof Delta;
  for (prop in delta) {
    // const value = Number.parseInt(delta[prop] as string);
    const value = delta[prop]!;
    wrapper.style[prop] = typeof value === 'string' ? value : `${value}px`;
  }
}

export function getStyle(
  wrapper: HTMLElement,
  prop: keyof CSSStyleDeclaration | string,
) {
  return wrapper.style[kebabCase(prop as string) as keyof CSSStyleDeclaration];
}

getRotate.reg = /rotateZ\((?<rotate>\d*)deg\)/;
export function getRotate(wrapper: HTMLElement) {
  const transform = getStyle(wrapper, 'transform') as string;
  return +(transform ? transform.match(getRotate.reg)?.groups?.rotate ?? 0 : 0);
}

export function matrix(rotate: number) {
  const radian = rotate / 2 / Math.PI;
  const sin = Math.sin(radian);
  const cos = Math.cos(radian);
  return `matrix(${cos}, ${sin}, -${sin}, ${cos}, 0, 0)`;
}
