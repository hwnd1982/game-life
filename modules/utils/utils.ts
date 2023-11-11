export const shuffle = (str: string) => {
  const arr = str.split('');
  return arr.reverse().reduce((arr, item, i) => {
    const j = Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] = [arr[j], item];

    return arr;
  }, arr).join('');
};

export const genCarNumber = () => {
  const letters = 'авекмнорстху';
  const region = [54, 70, 77, 22, 177, 55, 25, 42];

  return (
    shuffle(letters)[Math.floor(Math.random() * letters.length)] +
    shuffle(Math.random().toString().slice(2)).slice(-3) +
    shuffle(letters + letters).slice(-2) +
    region[Math.floor(Math.random() * region.length)]
  );
}