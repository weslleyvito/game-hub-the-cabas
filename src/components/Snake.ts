export type Position = {
  x: number;
  y: number;
};

export const moveSnake = (snake: Position[], direction: Position): Position[] => {
  const newSnake = [...snake];
  const head = { ...newSnake[0] };

  head.x += direction.x;
  head.y += direction.y;

  newSnake.unshift(head);
  newSnake.pop();

  return newSnake;
};

export const growSnake = (snake: Position[]): Position[] => {
  const newSnake = [...snake];
  const tail = newSnake[newSnake.length - 1];
  newSnake.push({ ...tail });
  return newSnake;
};

export const checkCollision = (snake: Position[]): boolean => {
  const [head, ...body] = snake;
  return body.some(segment => segment.x === head.x && segment.y === head.y);
};
