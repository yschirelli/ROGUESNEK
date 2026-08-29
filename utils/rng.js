import { ITEMS } from '../constants';

export const getRandomEmptyPos = (bounds, obstacles) => {
    let pos;
    let safe = false;
    let attempts = 0;
    while (!safe && attempts < 100) {
        attempts++;
        pos = {
            x: Math.floor(Math.random() * (bounds.right - bounds.left + 1)) + bounds.left,
            y: Math.floor(Math.random() * (bounds.bottom - bounds.top + 1)) + bounds.top
        };
        safe = !obstacles.some(o => o.x === pos.x && o.y === pos.y);
    }
    return pos;
};

export const generateDraftOptions = (items = ITEMS) => {
    return [...items].sort(() => 0.5 - Math.random()).slice(0, 3);
};
