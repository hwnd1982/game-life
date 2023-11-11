import 'normalize.css'
import './index.sass';
import { AppElement } from './Elements/AppElement';

class App extends AppElement {
  constructor() {
    super('div', { className: 'app' }, {
      parent: document.body
    });
  }
}

new App();
