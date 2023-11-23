import { AppElement } from "./AppElement";

export class RangeElement extends AppElement {
  constructor(size: number, textContent: string, callback: (value: number) => void) {
    const lebel = new AppElement('span', { className: 'range-value', textContent: `${size}` });

    super('div', { className: 'range' }, {
      appends: [
        new AppElement('lebel', { className: 'range-label' }, {
          appends: [
            new AppElement('span', { className: 'range-text', textContent }),
            lebel
          ]
        }),
        new AppElement('input', { className: 'range-input', type: 'range', min: '50', max: '2500', step: '25', value: `${size}` }, {
          cb(element) {
            (element as HTMLElement).addEventListener('change', () => {
              const value = (element as HTMLFormElement).value;

              callback(+value);
            });

            (element as HTMLElement).addEventListener('input', () => {
              const value = (element as HTMLFormElement).value;

              (lebel as HTMLFormElement).textContent = value;
            })
          },
        })
      ]
    })
  }
}
