import 'normalize.css'
import './index.sass';
import { AppElement } from './Elements/AppElement';
import { GameController } from './Controllers/GameController';
import { AppInitElement } from './Elements/AppInitElement';

class App extends AppElement {
  #game: GameController

  constructor() {
    super('div', { className: 'app' }, {
      parent: document.body
    });

    new AppInitElement(this);
  }
}

new App();
