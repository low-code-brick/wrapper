/**
 * 遍历树状结构数据
 * @param {Array<any>} arr 目标数状结构的数据
 * @param {Function} fn 回调
 * @param {String} childrenField children对应的字段名
 * @example [{ name: 'xxx', children: [{ name: 'childrenName' }] }]
 */
export function each<T>(
  arr: T[] = [],
  fn: (data: T, parent?: T, level?: number) => void,
  childrenField = 'childList',
  parent?: T,
  parentLevel?: number,
) {
  let level = parent == null ? 0 : (parentLevel as number) + 1;
  arr.forEach((data) => {
    const list = (data as any)[childrenField];
    if (list) {
      each(list, fn, childrenField, data, level);
    }
    fn(data, parent, level);
  });
}
