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
};

export function setStyle(wrapper: HTMLElement, delta: Delta) {
  let prop: keyof Delta;
  for (prop in delta) {
    const value = delta[prop] as number | string;
    wrapper.style[prop] = typeof value === 'string' ? value : `${value}px`;
  }
}
