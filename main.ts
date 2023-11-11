import 'normalize.css'
import './index.sass';
import { AppElement } from './Elements/AppElement';
import { Game } from './Modules/Game';

class App extends AppElement {
  constructor() {
    super('div', { className: 'app' }, {
      parent: document.body
    });
  }
}

new App();

const game = new Game(5, 5);

game.setAlive(1, 1);
game.setAlive(2, 2);
game.setAlive(3, 3);

console.log(game.step().map(row => [...row]));
console.log(game.step().map(row => [...row]));
console.log(game.step().map(row => [...row]));
console.log(game.step().map(row => [...row]));
