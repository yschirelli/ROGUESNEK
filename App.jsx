import React, { useRef, useEffect, useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { HUD } from './components/HUD';
import { MenuOverlay } from './components/Menu';
import { DraftOverlay } from './components/DraftOverlay';
import { Shop } from './components/Shop';

export default function App() {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const touchStartRef = useRef(null);

    const gameStateHook = useGameState(canvasRef);
    const {
        engineRef,
        setBoardDimensions,
        gameState, setGameState,
        stats, setStats,
        activeEffects,
        draftOptions,
        activePowerup,
        powerupCdPct,
        purchasedRelics,
        shopSessionBorderPurchases, setShopSessionBorderPurchases,
        isShaking,
        countdown,
        activeEvent,
        anomalyWarning,
        anomalyText,
        allowCheats, setAllowCheats,
        godmodeToggled, setGodmodeToggled,
        speedState, setSpeedState,
        customMultiplier, setCustomMultiplier,
        customShrinkingBorders, setCustomShrinkingBorders,
        startGame, startCountdown, handleDraftSelect
    } = gameStateHook;

    const [binds, setBinds] = useState({ UP: 'ArrowUp', DOWN: 'ArrowDown', LEFT: 'ArrowLeft', RIGHT: 'ArrowRight' });
    const [listeningKey, setListeningKey] = useState(null);
    const [controlMode, setControlMode] = useState('SWIPE');

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const w = containerRef.current.clientWidth;
                const h = containerRef.current.clientHeight;
                setBoardDimensions({ cols: Math.floor(w / 20), rows: Math.floor(h / 20) });
            }
        };
        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        if (typeof window !== 'undefined' && window.innerWidth < 768) setControlMode('DPAD');

        return () => window.removeEventListener('resize', updateDimensions);
    }, [setBoardDimensions]);

    const formatKeyName = (key) => {
        if (key === ' ') return 'SPACE';
        if (key.startsWith('Arrow')) return key.replace('Arrow', '').toUpperCase();
        return key.toUpperCase();
    };

    const getHealCost = () => Math.floor(10 * (engineRef.current?.inflation || 1));
    const getUpgradeCost = () => Math.floor(20 * (engineRef.current?.inflation || 1));
    const getBorderCost = () => Math.floor(30 * (engineRef.current?.inflation || 1) * Math.pow(1.5, shopSessionBorderPurchases));

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (listeningKey) {
                e.preventDefault();
                setBinds(prev => ({ ...prev, [listeningKey]: e.key }));
                setListeningKey(null);
                return;
            }

            if (gameState === 'PLAYING' && engineRef.current) {
                if (Object.values(binds).includes(e.key) || e.key === ' ') e.preventDefault();
                if (e.key === binds.UP) engineRef.current.setDirection(0, -1);
                if (e.key === binds.DOWN) engineRef.current.setDirection(0, 1);
                if (e.key === binds.LEFT) engineRef.current.setDirection(-1, 0);
                if (e.key === binds.RIGHT) engineRef.current.setDirection(1, 0);
                if (e.key === ' ' && activePowerup) engineRef.current.activatePowerup();
                return;
            }

            if (['1', '2', '3', '4', '5', '6', '8'].includes(e.key)) {
                e.preventDefault();
                if (gameState === 'MENU') {
                    if (e.key === '1' || e.key === 'Enter') setGameState('MENU_MODES');
                } else if (gameState === 'MENU_MODES') {
                    if (e.key === '1') startGame('NORMAL');
                    if (e.key === '2') startGame('PSYCHO');
                    if (e.key === '3') startGame('ZEN');
                    if (e.key === '4') setGameState('CUSTOM_RUN_SETUP');
                } else if (gameState === 'CUSTOM_RUN_SETUP') {
                    if (e.key === 'Enter') startGame('CUSTOM', customMultiplier, customShrinkingBorders);
                    if (e.key === 'ArrowLeft') setCustomMultiplier(prev => Math.max(0.5, prev - 0.1));
                    if (e.key === 'ArrowRight') setCustomMultiplier(prev => Math.min(3.0, prev + 0.1));
                    if (e.key === 't' || e.key === 'T') setCustomShrinkingBorders(prev => !prev);
                } else if (gameState === 'PAUSED') {
                    if (e.key === '1') startCountdown();
                    if (e.key === '2') setGameState('CONFIRM_RESTART');
                    if (e.key === '3') setGameState('SETTINGS');
                    if (e.key === '4') { engineRef.current?.pause(); setGameState('MENU'); }
                    if (e.key === '5' && allowCheats) setGameState('CHEAT_MENU');
                } else if (gameState === 'CONFIRM_RESTART') {
                    if (e.key === '1') startGame(engineRef.current?.gameMode);
                    if (e.key === '2') setGameState('PAUSED');
                } else if (gameState === 'SHOP') {
                    if (e.key === '1' && stats.coins >= getHealCost()) {
                        engineRef.current.stats.coins -= getHealCost();
                        engineRef.current.pendingGrowth += 5;
                        setStats({ ...stats, coins: engineRef.current.stats.coins });
                    }
                    if (e.key === '2' && stats.coins >= getUpgradeCost() && activePowerup) {
                        engineRef.current.stats.coins -= getUpgradeCost();
                        engineRef.current.activePowerup.cd *= 0.8;
                        setStats({ ...stats, coins: engineRef.current.stats.coins });
                    }
                    if (e.key === '3' && stats.coins >= getBorderCost() && engineRef.current?.canEnlargeBorder()) {
                        engineRef.current.stats.coins -= getBorderCost();
                        engineRef.current.enlargeBorder();
                        setShopSessionBorderPurchases(prev => prev + 1);
                        setStats({ ...stats, coins: engineRef.current.stats.coins });
                    }
                    if (e.key === '4') { engineRef.current?.resume(); setGameState('PLAYING'); }
                } else if (gameState === 'DRAFT') {
                    const idx = parseInt(e.key) - 1;
                    if (idx >= 0 && idx < draftOptions.length) handleDraftSelect(draftOptions[idx]);
                } else if (gameState === 'GAMEOVER' && e.key === '1') {
                    startGame(engineRef.current?.gameMode);
                } else if (gameState === 'CHEAT_MENU') {
                    if (e.key === '1') {
                        const newState = !godmodeToggled;
                        setGodmodeToggled(newState);
                        if (engineRef.current) engineRef.current.godmode = newState;
                    }
                    if (e.key === '2') setGameState('CHEAT_CREDITS');
                    if (e.key === '3') {
                        const nextState = speedState === 'NORMAL' ? 'FAST' : speedState === 'FAST' ? 'SLOW' : 'NORMAL';
                        setSpeedState(nextState);
                        if (engineRef.current) engineRef.current.speedCheatMultiplier = nextState === 'NORMAL' ? 1.0 : nextState === 'FAST' ? 0.5 : 2.0;
                    }
                    if (e.key === '4') setGameState('CHEAT_EVENTS');
                    if (e.key === '5') { setShopSessionBorderPurchases(0); setGameState('SHOP'); }
                    if (e.key === '6') setGameState('PAUSED');
                } else if (gameState === 'CHEAT_EVENTS') {
                    const shortcuts = '1234567890qwerty';
                    const idx = shortcuts.indexOf(e.key.toLowerCase());
                    if (idx >= 0 && idx < ANOMALIES.length && engineRef.current) {
                        engineRef.current.triggerRandomEvent(idx);
                        setGameState('CHEAT_MENU');
                    }
                } else if (gameState === 'SETTINGS') {
                    if (e.key === '1') setListeningKey('UP');
                    if (e.key === '2') setListeningKey('DOWN');
                    if (e.key === '3') setListeningKey('LEFT');
                    if (e.key === '4') setListeningKey('RIGHT');
                    if (e.key === '5') setControlMode(prev => prev === 'SWIPE' ? 'DPAD' : 'SWIPE');
                    if (e.key === '6') setGameState('PAUSED');
                }
            }

            if (e.key === 'Escape') {
                if (gameState === 'PLAYING') { engineRef.current?.pause(); setGameState('PAUSED'); }
                else if (['SETTINGS', 'CONFIRM_RESTART', 'CHEAT_MENU'].includes(gameState)) setGameState('PAUSED');
                else if (['CHEAT_EVENTS', 'CHEAT_CREDITS'].includes(gameState)) setGameState('CHEAT_MENU');
                else if (gameState === 'MENU_MODES') setGameState('MENU');
                else if (gameState === 'CUSTOM_RUN_SETUP') setGameState('MENU_MODES');
            }
        };

        window.addEventListener('keydown', handleKeyDown, { passive: false });
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        gameState, activePowerup, listeningKey, binds, allowCheats, stats.coins,
        draftOptions, controlMode, godmodeToggled, speedState, setSpeedState,
        setGodmodeToggled, engineRef, setBinds, setListeningKey, setControlMode,
        setGameState, setShopSessionBorderPurchases, setStats, startCountdown, startGame,
        stats, shopSessionBorderPurchases, handleDraftSelect
    ]);

    const handleTouchStart = (e) => {
        if (controlMode === 'DPAD') return;
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e) => {
        if (controlMode === 'DPAD' || !touchStartRef.current || gameState !== 'PLAYING' || !engineRef.current) return;
        const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
        const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
        if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
            if (Math.abs(dx) > Math.abs(dy)) engineRef.current.setDirection(dx > 0 ? 1 : -1, 0);
            else engineRef.current.setDirection(0, dy > 0 ? 1 : -1);
        }
        touchStartRef.current = null;
    };

    return (
        <div ref={containerRef} className="fixed inset-0 bg-black text-[#00FF00] font-mono flex flex-col overflow-hidden select-none" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            <style dangerouslySetInnerHTML={{ __html: ` * { -webkit-tap-highlight-color: transparent; } .shake { transform: translate(4px, 4px); } .terminal-blink { animation: term-blink 1s step-end infinite; } @keyframes term-blink { 50% { opacity: 0; } } ` }} />

            <HUD
                stats={stats}
                gameMode={engineRef.current?.gameMode}
                setGameState={setGameState}
                engineRef={engineRef}
                activeEffects={activeEffects}
                activePowerup={activePowerup}
                powerupCdPct={powerupCdPct}
                purchasedRelics={purchasedRelics}
            />

            <div className={`flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden ${isShaking ? 'shake' : ''}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <canvas ref={canvasRef} className="block bg-black" />

                {anomalyText && (
                    <div className="absolute top-2 w-full text-center z-10 pointer-events-none">
                        <pre className="inline-block bg-black/90 px-4 py-2 border border-current text-sm md:text-base shadow-lg"
                            style={{ color: anomalyText.type === 'NEG' ? '#FF0000' : anomalyText.type === 'POS' ? '#00FF00' : '#FFFF00' }}>
                            {anomalyText.name}
                            <br />
                            [{'#'.repeat(Math.round(anomalyText.pct * 20))}{'.'.repeat(20 - Math.round(anomalyText.pct * 20))}]
                        </pre>
                    </div>
                )}

                {anomalyWarning > 0 && gameState === 'PLAYING' && (
                    <div className="absolute top-1/3 w-full text-center z-20 pointer-events-none animate-pulse">
                        <span className="bg-black border-2 border-[#FFFF00] text-[#FFFF00] px-6 py-2 text-xl font-bold shadow-[4px_4px_0px_#FFFF00]">
                            ANOMALY IMMINENT: {anomalyWarning}
                        </span>
                    </div>
                )}

                {activeEvent && gameState === 'PLAYING' && (
                    <div className="absolute top-1/4 w-full text-center z-20 pointer-events-none animate-pulse">
                        <span className="bg-black border-2 px-6 py-2 text-xl font-bold shadow-lg" style={{ borderColor: activeEvent.color, color: activeEvent.color, boxShadow: `4px 4px 0px ${activeEvent.color}` }}>
                            {activeEvent.msg}
                        </span>
                    </div>
                )}

                {gameState === 'MENU' || gameState === 'MENU_MODES' || gameState === 'CUSTOM_RUN_SETUP' || gameState === 'PAUSED' || gameState === 'CHEAT_MENU' || gameState === 'CHEAT_CREDITS' || gameState === 'CHEAT_EVENTS' || gameState === 'SETTINGS' || gameState === 'CONFIRM_RESTART' || gameState === 'GAMEOVER' ? (
                    <MenuOverlay
                        gameState={gameState}
                        setGameState={setGameState}
                        startGame={startGame}
                        engineRef={engineRef}
                        stats={stats}
                        setStats={setStats}
                        allowCheats={allowCheats}
                        setAllowCheats={setAllowCheats}
                        godmodeToggled={godmodeToggled}
                        setGodmodeToggled={setGodmodeToggled}
                        speedState={speedState}
                        setSpeedState={setSpeedState}
                        customMultiplier={customMultiplier}
                        setCustomMultiplier={setCustomMultiplier}
                        customShrinkingBorders={customShrinkingBorders}
                        setCustomShrinkingBorders={setCustomShrinkingBorders}
                        setShopSessionBorderPurchases={setShopSessionBorderPurchases}
                        startCountdown={startCountdown}
                        binds={binds}
                        listeningKey={listeningKey}
                        setListeningKey={setListeningKey}
                        controlMode={controlMode}
                        setControlMode={setControlMode}
                        formatKeyName={formatKeyName}
                    />
                ) : null}

                {gameState === 'COUNTDOWN' && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-30 pointer-events-none">
                        <span className="text-8xl font-bold animate-ping text-[#00FF00]">{countdown}</span>
                    </div>
                )}

                {gameState === 'DRAFT' && (
                    <DraftOverlay draftOptions={draftOptions} handleDraftSelect={handleDraftSelect} />
                )}

                {gameState === 'SHOP' && (
                    <Shop
                        stats={stats}
                        setStats={setStats}
                        engineRef={engineRef}
                        activePowerup={activePowerup}
                        shopSessionBorderPurchases={shopSessionBorderPurchases}
                        setShopSessionBorderPurchases={setShopSessionBorderPurchases}
                        startCountdown={startCountdown}
                    />
                )}
            </div>

            {controlMode === 'DPAD' && gameState === 'PLAYING' && (
                <div className="h-[180px] w-full bg-black border-t border-[#002200] flex items-center justify-center shrink-0">
                    <div className="grid grid-cols-3 grid-rows-2 gap-2 w-64 h-40 py-2">
                        <div />
                        <button className="border-2 border-[#00FF00] text-[#00FF00] text-2xl font-bold active:bg-[#00FF00] active:text-black flex items-center justify-center" onClick={() => engineRef.current?.setDirection(0, -1)}>^</button>
                        <div />
                        <button className="border-2 border-[#00FF00] text-[#00FF00] text-2xl font-bold active:bg-[#00FF00] active:text-black flex items-center justify-center" onClick={() => engineRef.current?.setDirection(-1, 0)}>&lt;</button>
                        <button className="border-2 border-[#00FF00] text-[#00FF00] text-2xl font-bold active:bg-[#00FF00] active:text-black flex items-center justify-center" onClick={() => engineRef.current?.setDirection(0, 1)}>v</button>
                        <button className="border-2 border-[#00FF00] text-[#00FF00] text-2xl font-bold active:bg-[#00FF00] active:text-black flex items-center justify-center" onClick={() => engineRef.current?.setDirection(1, 0)}>&gt;</button>
                    </div>
                </div>
            )}
        </div>
    );
}