import React from 'react';
import { TerminalMenuBox } from './TerminalMenuBox';
import { ANOMALIES } from '../constants';
import { formatTime } from '../utils/formatters';

export function MenuOverlay(props) {
    const {
        gameState,
        setGameState,
        startGame,
        engineRef,
        stats,
        setStats,
        allowCheats,
        setAllowCheats,
        godmodeToggled,
        setGodmodeToggled,
        speedState,
        setSpeedState,
        customMultiplier,
        setCustomMultiplier,
        customShrinkingBorders,
        setCustomShrinkingBorders,
        setShopSessionBorderPurchases,
        startCountdown,
        binds,
        listeningKey,
        setListeningKey,
        controlMode,
        setControlMode,
        formatKeyName,
    } = props;

    const toggleGodmode = () => {
        const newState = !godmodeToggled;
        setGodmodeToggled(newState);
        if (engineRef.current) engineRef.current.godmode = newState;
    };

    const toggleSpeed = () => {
        const nextState = speedState === 'NORMAL' ? 'FAST' : speedState === 'FAST' ? 'SLOW' : 'NORMAL';
        setSpeedState(nextState);
        if (engineRef.current) {
            engineRef.current.speedCheatMultiplier = nextState === 'NORMAL' ? 1.0 : nextState === 'FAST' ? 0.5 : 2.0;
        }
    };

    if (gameState === 'MENU') {
        return (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-30 p-4">
                <pre className="text-[10px] sm:text-[14px] md:text-xl font-bold mb-8 text-center leading-tight whitespace-pre">
                    {` ___  ___  ___  _ _  ___  ___  _ _  ___  _ _ 
| . \\| . |/ __>| | || __>/ __>| \\ || __>| | |
|   /| | |\\__ \\| ' || _> \\__ \\|   || _> | / /
|_\\_\\\`___'<___/\`___'|___><___/|_\\_||___>|_\\_\\`}
                </pre>
                <div className="flex flex-col gap-4 mt-8 w-full max-w-sm">
                    <button onClick={() => setGameState('MENU_MODES')} className="border border-[#00FF00] p-3 text-center hover:bg-[#00FF00] hover:text-black font-bold transition-colors shadow-[0_0_10px_#00FF00]">
                        [1] PLAY ROGUESNEK
                    </button>
                </div>
                <div className="text-center mt-8">
                    <p className="md:text-xl terminal-blink">&gt; PRESS START TO INITIALIZE</p>
                    <p className="text-xs md:text-sm opacity-70 mt-4">CONTROLS: ARROWS/WASD OR SWIPE</p>
                </div>
                <button
                    className="absolute bottom-4 left-4 z-40 text-sm md:text-base flex items-center gap-2 hover:bg-[#00FF00] hover:text-black p-2 transition-colors border border-transparent hover:border-[#00FF00]"
                    onClick={() => setAllowCheats(!allowCheats)}
                >
                    [{allowCheats ? 'X' : ' '}] ALLOW_CHEATS?
                </button>
                <div className="absolute bottom-4 right-4 opacity-50 text-sm font-bold tracking-widest">v1.7</div>
            </div>
        );
    }

    if (gameState === 'MENU_MODES') {
        return (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-30 p-4">
                <pre className="text-[10px] sm:text-[14px] md:text-xl font-bold mb-8 text-center leading-tight whitespace-pre">
                    {` ___  ___  ___  _ _  ___  ___  _ _  ___  _ _ 
| . \\| . |/ __>| | || __>/ __>| \\ || __>| | |
|   /| | |\\__ \\| ' || _> \\__ \\|   || _> | / /
|_\\_\\\`___'<___/\`___'|___><___/|_\\_||___>|_\\_\\`}
                </pre>
                <div className="flex flex-col gap-4 mt-8 w-full max-w-sm">
                    <button onClick={() => startGame('NORMAL')} className="border border-[#00FF00] p-3 text-center hover:bg-[#00FF00] hover:text-black font-bold transition-colors">
                        [1] NORMAL MODE
                    </button>
                    <button onClick={() => startGame('PSYCHO')} className="border border-[#FF0000] text-[#FF0000] p-3 text-center hover:bg-[#FF0000] hover:text-black font-bold transition-colors shadow-[0_0_10px_#FF0000]">
                        [2] PSYCHO MODE (SCALING SPEED + BORDER SHRINK)
                    </button>
                    <button onClick={() => startGame('ZEN')} className="border border-[#00FFFF] text-[#00FFFF] p-3 text-center hover:bg-[#00FFFF] hover:text-black font-bold transition-colors">
                        [3] ZEN MODE (PURE SNAKE)
                    </button>
                    <button onClick={() => setGameState('CUSTOM_RUN_SETUP')} className="border border-[#FF00FF] text-[#FF00FF] p-3 text-center hover:bg-[#FF00FF] hover:text-black font-bold transition-colors shadow-[0_0_10px_#FF00FF]">
                        [4] CUSTOM MODE
                    </button>
                    <button onClick={() => setGameState('MENU')} className="border border-[#00FF00] p-2 mt-4 text-center hover:bg-[#00FF00] hover:text-black font-bold transition-colors opacity-80">
                        [ESC] BACK
                    </button>
                </div>
                <div className="text-center mt-8">
                    <p className="md:text-xl terminal-blink">&gt; SELECT A DIFFICULTY</p>
                </div>
            </div>
        );
    }

    if (gameState === 'CUSTOM_RUN_SETUP') {
        return (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 z-30">
                <TerminalMenuBox title="CUSTOM MULTIPLIER">
                    <div className="flex flex-col gap-6 w-full px-4 text-center">
                        <p className="mb-2 text-[#FFFF00] font-bold text-lg md:text-xl">CURRENT: {customMultiplier.toFixed(1)}x</p>
                        <input
                            type="range"
                            min="0.5"
                            max="3.0"
                            step="0.1"
                            value={customMultiplier}
                            onChange={(e) => setCustomMultiplier(parseFloat(e.target.value))}
                            className="w-full accent-[#00FF00]"
                        />
                        <div className="flex justify-between text-xs opacity-70 mt-1">
                            <span>0.5x (EZ)</span>
                            <span>3.0x (INSANE)</span>
                        </div>
                        <div className="text-xs md:text-sm space-y-2 opacity-80 bg-[#002200] p-4 border border-[#00FF00] text-left">
                            <p>► SPEED: {(customMultiplier * 100).toFixed(0)}%</p>
                            <p>► HAZARD/EVENT FREQ: {(customMultiplier * 100).toFixed(0)}%</p>
                            <p>► REWARDS: {(customMultiplier * 100).toFixed(0)}%</p>
                        </div>
                        <button onClick={() => setCustomShrinkingBorders(!customShrinkingBorders)} className={`w-full p-2 border font-bold transition-colors ${customShrinkingBorders ? 'border-[#FF0000] text-[#FF0000] hover:bg-[#FF0000] hover:text-black' : 'border-[#00FF00] text-[#00FF00] hover:bg-[#00FF00] hover:text-black'}`}>
                            [T] SHRINKING BORDERS: {customShrinkingBorders ? 'ON' : 'OFF'}
                        </button>
                        <button onClick={() => startGame('CUSTOM', customMultiplier, customShrinkingBorders)} className="border border-[#00FF00] bg-[#00FF00] text-black p-3 font-bold hover:bg-black hover:text-[#00FF00] transition-colors mt-2">
                            [ENTER] INITIALIZE RUN
                        </button>
                        <button onClick={() => setGameState('MENU_MODES')} className="border border-[#00FF00] p-2 text-center hover:bg-[#00FF00] hover:text-black font-bold transition-colors opacity-80">
                            [ESC] CANCEL
                        </button>
                    </div>
                </TerminalMenuBox>
            </div>
        );
    }

    if (gameState === 'PAUSED') {
        return (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 z-30">
                <TerminalMenuBox title="SYSTEM PAUSED">
                    <div className="flex flex-col gap-4">
                        <button onClick={startCountdown} className="border border-[#00FF00] p-3 text-left hover:bg-[#00FF00] hover:text-black transition-colors font-bold">
                            [1] RESUME
                        </button>
                        <button onClick={() => setGameState('CONFIRM_RESTART')} className="border border-[#00FF00] p-3 text-left hover:bg-[#00FF00] hover:text-black transition-colors font-bold">
                            [2] RESTART RUN
                        </button>
                        <button onClick={() => setGameState('SETTINGS')} className="border border-[#00FF00] p-3 text-left hover:bg-[#00FF00] hover:text-black transition-colors font-bold">
                            [3] SETTINGS
                        </button>
                        <button onClick={() => { engineRef.current?.pause(); setGameState('MENU'); }} className="border border-[#00FF00] p-3 text-left hover:bg-[#00FF00] hover:text-black transition-colors font-bold">
                            [4] EXIT TO MENU
                        </button>
                        {allowCheats && (
                            <button onClick={() => setGameState('CHEAT_MENU')} className="border border-[#FFFF00] text-[#FFFF00] p-3 text-left hover:bg-[#FFFF00] hover:text-black transition-colors font-bold mt-4 animate-pulse">
                                [5] CHEAT_MENU
                            </button>
                        )}
                    </div>
                </TerminalMenuBox>
            </div>
        );
    }

    if (gameState === 'CHEAT_MENU') {
        return (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 z-30">
                <TerminalMenuBox title="DEBUG / CHEAT MENU">
                    <div className="flex flex-col gap-3">
                        <button onClick={toggleGodmode} className="border border-[#FFFF00] text-[#FFFF00] p-3 text-left hover:bg-[#FFFF00] hover:text-black transition-colors font-bold">
                            [1] TOGGLE GODMODE: [{godmodeToggled ? 'X' : ' '}]
                        </button>
                        <button onClick={() => setGameState('CHEAT_CREDITS')} className="border border-[#FFFF00] text-[#FFFF00] p-3 text-left hover:bg-[#FFFF00] hover:text-black transition-colors font-bold">
                            [2] SET CREDITS
                        </button>
                        <button onClick={toggleSpeed} className="border border-[#FFFF00] text-[#FFFF00] p-3 text-left hover:bg-[#FFFF00] hover:text-black transition-colors font-bold">
                            [3] GAME SPEED: [{speedState}]
                        </button>
                        <button onClick={() => setGameState('CHEAT_EVENTS')} className="border border-[#FFFF00] text-[#FFFF00] p-3 text-left hover:bg-[#FFFF00] hover:text-black transition-colors font-bold">
                            [4] FORCE EVENT
                        </button>
                        <button onClick={() => { setShopSessionBorderPurchases(0); setGameState('SHOP'); }} className="border border-[#FFFF00] text-[#FFFF00] p-3 text-left hover:bg-[#FFFF00] hover:text-black transition-colors font-bold">
                            [5] OPEN SHOP
                        </button>
                        <button onClick={() => setGameState('PAUSED')} className="border border-[#00FF00] p-3 text-left hover:bg-[#00FF00] hover:text-black transition-colors font-bold mt-4">
                            [6] BACK TO PAUSE
                        </button>
                    </div>
                </TerminalMenuBox>
            </div>
        );
    }

    if (gameState === 'CHEAT_CREDITS') {
        return (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 z-30">
                <TerminalMenuBox title="OVERRIDE CREDITS">
                    <p className="mb-4">ENTER NEW CREDIT BALANCE:</p>
                    <input
                        type="number"
                        autoFocus
                        placeholder="e.g. 999"
                        className="bg-black border-2 border-[#FFFF00] text-[#FFFF00] p-4 outline-none w-full font-bold text-xl mb-4 appearance-none"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const val = parseInt(e.target.value) || 0;
                                if (engineRef.current) {
                                    engineRef.current.stats.coins = val;
                                    setStats({ ...stats, coins: val });
                                }
                                setGameState('CHEAT_MENU');
                            }
                            if (e.key === 'Escape') setGameState('CHEAT_MENU');
                        }}
                    />
                    <p className="text-xs opacity-70 mt-2">&gt; PRESS [ENTER] TO CONFIRM OR [ESC] TO CANCEL.</p>
                </TerminalMenuBox>
            </div>
        );
    }

    if (gameState === 'CHEAT_EVENTS') {
        return (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 z-30">
                <TerminalMenuBox title="FORCE ANOMALY EVENT">
                    <div className="flex flex-col gap-2">
                        {ANOMALIES.map((ev, idx) => {
                            const shortcuts = '1234567890QWERTY';
                            const keyChar = shortcuts[idx] || '?';
                            return (
                                <button
                                    key={idx}
                                    onClick={() => { engineRef.current?.triggerRandomEvent(idx); setGameState('CHEAT_MENU'); }}
                                    className={`border p-2 text-left hover:text-black transition-colors font-bold text-xs md:text-sm ${ev.type === 'NEG' ? 'border-[#FF0000] text-[#FF0000] hover:bg-[#FF0000]' : ev.type === 'POS' ? 'border-[#00FF00] hover:bg-[#00FF00]' : 'border-[#FFFF00] text-[#FFFF00] hover:bg-[#FFFF00]'}`}
                                >
                                    [{keyChar}] {ev.name}
                                </button>
                            );
                        })}
                    </div>
                    <button onClick={() => setGameState('CHEAT_MENU')} className="border border-[#00FF00] p-3 text-left hover:bg-[#00FF00] hover:text-black transition-colors font-bold mt-4">
                        [ESC] BACK
                    </button>
                </TerminalMenuBox>
            </div>
        );
    }

    if (gameState === 'SETTINGS') {
        return (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 z-30">
                <TerminalMenuBox title="CONTROL CONFIGURATION">
                    <p className="text-xs mb-6 opacity-80 text-center">CLICK A BINDING, THEN PRESS NEW KEY</p>
                    <div className="flex flex-col gap-4 mb-6">
                        {['UP', 'DOWN', 'LEFT', 'RIGHT'].map((dir, idx) => (
                            <button
                                key={dir}
                                onClick={() => setListeningKey(dir)}
                                className={`border p-3 flex justify-between items-center transition-colors ${listeningKey === dir ? 'border-[#FFFF00] text-[#FFFF00] bg-[#FFFF00]/10 animate-pulse' : 'border-[#00FF00] hover:bg-[#00FF00] hover:text-black'}`}
                            >
                                <span>[{idx + 1}] {dir}_VECTOR</span>
                                <span className="font-bold">[{listeningKey === dir ? '???' : formatKeyName(binds[dir])}]</span>
                            </button>
                        ))}

                        <button
                            onClick={() => setControlMode(prev => prev === 'SWIPE' ? 'DPAD' : 'SWIPE')}
                            className="border border-[#00FF00] p-3 flex justify-between items-center hover:bg-[#00FF00] hover:text-black transition-colors"
                        >
                            <span>[5] CONTROL MODE</span>
                            <span className="font-bold">[{controlMode}]</span>
                        </button>
                    </div>
                    <button onClick={() => setGameState('PAUSED')} className="border border-[#00FF00] py-2 hover:bg-[#00FF00] hover:text-black text-center mt-4 font-bold">
                        [6] RETURN
                    </button>
                </TerminalMenuBox>
            </div>
        );
    }

    if (gameState === 'CONFIRM_RESTART') {
        return (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 z-30">
                <TerminalMenuBox title="CONFIRM REBOOT">
                    <p className="text-center mb-8 text-lg text-[#FF0000]">WARNING: ALL PROGRESS WILL BE LOST.</p>
                    <div className="flex gap-4 flex-col md:flex-row">
                        <button onClick={() => startGame(engineRef.current?.gameMode)} className="flex-1 border border-[#FF0000] text-[#FF0000] p-3 text-center hover:bg-[#FF0000] hover:text-black transition-colors font-bold">
                            [1] YES_REBOOT
                        </button>
                        <button onClick={() => setGameState('PAUSED')} className="flex-1 border border-[#00FF00] p-3 text-center hover:bg-[#00FF00] hover:text-black transition-colors font-bold">
                            [2] CANCEL
                        </button>
                    </div>
                </TerminalMenuBox>
            </div>
        );
    }

    if (gameState === 'GAMEOVER') {
        return (
            <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-4 z-30">
                <pre className="text-[#FF0000] text-3xl md:text-5xl font-bold mb-6 text-center">
                    {` FATAL ERROR 
 SYSTEM HALTED`}
                </pre>

                <div className="border border-[#00FF00] p-6 w-full max-w-sm mb-8 space-y-2 text-sm md:text-lg">
                    <div className="flex justify-between">
                        <span>FINAL_SCORE:</span>
                        <span>{stats.score.toString().padStart(5, '0')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>TIME_SURVIVED:</span>
                        <span>{formatTime(stats.timeElapsed)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>MAX_INTEGRITY:</span>
                        <span>{stats.length}</span>
                    </div>
                </div>

                <button onClick={() => startGame(engineRef.current?.gameMode)} className="border-2 border-[#00FF00] bg-[#00FF00] text-black px-6 py-3 font-bold hover:bg-black hover:text-[#00FF00] transition-colors">
                    [1] REBOOT_SYSTEM
                </button>
            </div>
        );
    }

    return null;
}
