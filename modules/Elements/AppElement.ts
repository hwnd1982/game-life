export class AppElement {
  constructor(
    tag: string,
    attr?: {
      [key: string]: string
    }, {
      append,
      appends,
      parent,
      cb
    }: {
      append?: AppElement
      appends?: AppElement[]
      parent?: AppElement | HTMLElement | string | null
      cb?: (element: AppElement) => void
    } = {}
  ) {
    const element = document.createElement(tag);

    if (attr) {
      Object.assign(element, attr);
    }

    if (append && append instanceof HTMLElement) {
      element.append(append);
    }

    if (appends && appends.every(item => item instanceof HTMLElement)) {
      element.append(...appends as HTMLElement[]);
    }

    if (parent) {
      if (typeof parent === 'string') {
        parent = document.querySelector(parent);
      }

      if (parent && parent instanceof HTMLElement) {
        parent.append(element);
      }
    }

    if (cb && typeof cb === "function") {
      cb(element);
    }

    return element;
  }
}
