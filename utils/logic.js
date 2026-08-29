export const isOutOfBounds = (pos, bounds) => {
    return pos.x < bounds.left || pos.x > bounds.right || pos.y < bounds.top || pos.y > bounds.bottom;
};

export const filterOutOfBounds = (entities, bounds) => {
    return entities.filter(p => !isOutOfBounds(p, bounds));
};

export const canEnlargeBorder = (bounds, rows, cols) => {
    return bounds.top > 0 || bounds.bottom < rows - 1 || bounds.left > 0 || bounds.right < cols - 1;
};

export const enlargeBorder = (bounds, rows, cols) => {
    let enlarged = false;
    let newBounds = { ...bounds };
    if (newBounds.top > 0) { newBounds.top--; enlarged = true; }
    if (newBounds.bottom < rows - 1) { newBounds.bottom++; enlarged = true; }
    if (newBounds.left > 0) { newBounds.left--; enlarged = true; }
    if (newBounds.right < cols - 1) { newBounds.right++; enlarged = true; }
    return { enlarged, bounds: newBounds };
};

export const getCollisionIndex = (entities, head) => {
    return entities.findIndex(e => e.x === head.x && e.y === head.y);
};

export const checkSelfCollision = (snake, head, godmode) => {
    if (godmode) return false;
    return snake.some(seg => seg.x === head.x && seg.y === head.y);
};

export const calculateExplosionHits = (snake, x, y, isGiant) => {
    const radius = isGiant ? 2 : 1;
    let headCaught = (Math.abs(snake[0].x - x) <= radius && Math.abs(snake[0].y - y) <= radius);

    let segmentsCaught = 0;
    for (let i = 1; i < snake.length; i++) {
        let seg = snake[i];
        if (Math.abs(seg.x - x) <= radius && Math.abs(seg.y - y) <= radius) segmentsCaught++;
    }

    return { headCaught, segmentsCaught };
};

export const calculateWrappedPosition = (newHead, bounds) => {
    let wrapped = false;
    let pos = { ...newHead };

    if (pos.x < bounds.left) { pos.x = bounds.right; wrapped = true; }
    else if (pos.x > bounds.right) { pos.x = bounds.left; wrapped = true; }

    if (pos.y < bounds.top) { pos.y = bounds.bottom; wrapped = true; }
    else if (pos.y > bounds.bottom) { pos.y = bounds.top; wrapped = true; }

    return { pos, wrapped };
};
