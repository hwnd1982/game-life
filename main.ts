import 'normalize.css'
import './index.sass';
import { AppElement } from './Elements/AppElement';
import { GameController } from './Controllers/GameController';

class App extends AppElement {
  constructor() {
    super('div', { className: 'app' }, {
      parent: document.body
    });

    new GameController(300, 150, this).fill(25).start();
  }
}

const app = new App();
