export function createSVGElement(name: string, classNames: string[] = []) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  classNames.forEach((className) => element.classList.add(className));
  return element;
}
