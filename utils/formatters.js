export const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const getLevelBar = (filled, req) => {
    const empty = Math.max(0, req - filled);
    return `[${'#'.repeat(filled)}${'.'.repeat(empty)}]`;
};
