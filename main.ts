import 'normalize.css'
import './index.sass';
import { AppElement } from './Elements/AppElement';
import { AppInitElement } from './Elements/AppInitElement';

class App extends AppElement {
  constructor(height: number, width: number) {
    super('div', { className: 'app' }, {
      parent: document.body
    });

    new AppInitElement(height, width, this);
  }
}

new App(325, 525);
