import { useState, useEffect, useRef } from 'react';
import { GameEngine } from '../utils/GameEngine';
import { generateDraftOptions } from '../utils/rng';
import { GRID_SIZE } from '../constants';

export function useGameState(canvasRef) {
    const engineRef = useRef(null);
    const [boardDimensions, setBoardDimensions] = useState({ cols: 0, rows: 0 });
    const [gameState, setGameState] = useState('MENU');
    const [stats, setStats] = useState({ score: 0, coins: 0, length: 3, applesEaten: 0, timeElapsed: 0, level: 1, levelProgress: 0 });
    const [activeEffects, setActiveEffects] = useState([]);

    const [draftOptions, setDraftOptions] = useState([]);
    const [activePowerup, setActivePowerup] = useState(null);
    const [powerupCdPct, setPowerupCdPct] = useState(0);
    const [purchasedRelics, setPurchasedRelics] = useState([]);
    const [shopSessionBorderPurchases, setShopSessionBorderPurchases] = useState(0);

    const [isShaking, setIsShaking] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [activeEvent, setActiveEvent] = useState(null);
    const [anomalyWarning, setAnomalyWarning] = useState(0);
    const [anomalyText, setAnomalyText] = useState(null);

    const [allowCheats, setAllowCheats] = useState(false);
    const [godmodeToggled, setGodmodeToggled] = useState(false);
    const [speedState, setSpeedState] = useState('NORMAL');
    const [customMultiplier, setCustomMultiplier] = useState(1.0);
    const [customShrinkingBorders, setCustomShrinkingBorders] = useState(false);

    useEffect(() => {
        if (!canvasRef.current || boardDimensions.cols === 0) return;

        if (!engineRef.current) {
            engineRef.current = new GameEngine(canvasRef.current, {
                onStatsUpdate: setStats,
                onEffectsUpdate: setActiveEffects,
                onDraft: () => { engineRef.current.pause(); setDraftOptions(generateDraftOptions()); setGameState('DRAFT'); },
                onShop: () => { engineRef.current.pause(); setShopSessionBorderPurchases(0); setGameState('SHOP'); },
                onDeath: () => setGameState('GAMEOVER'),
                onShake: () => { setIsShaking(true); setTimeout(() => setIsShaking(false), 150); },
                onCdUpdate: setPowerupCdPct,
                onEvent: (msg, color) => {
                    setActiveEvent({ msg, color });
                    setTimeout(() => setActiveEvent(null), 3000);
                },
                onAnomalyWarning: setAnomalyWarning,
                onAnomalyUpdate: setAnomalyText
            }, boardDimensions.cols, boardDimensions.rows);
        }

        let animationId;
        let lastTime = performance.now();

        const loop = (time) => {
            const delta = time - lastTime;
            lastTime = time;
            if (engineRef.current) {
                engineRef.current.update(delta);
                engineRef.current.draw();
            }
            animationId = requestAnimationFrame(loop);
        };

        animationId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationId);
    }, [boardDimensions.cols, boardDimensions.rows, canvasRef]);

    const startGame = (mode, multiplier = 1.0, shrinkingBorders = false) => {
        if (engineRef.current) {
            engineRef.current.init(mode, multiplier, shrinkingBorders);
            engineRef.current.godmode = allowCheats && godmodeToggled;
            engineRef.current.speedCheatMultiplier = speedState === 'NORMAL' ? 1.0 : speedState === 'FAST' ? 0.5 : 2.0;

            engineRef.current.start();
            setActivePowerup(null);
            setPurchasedRelics([]);
            setPowerupCdPct(0);
            setActiveEvent(null);
            setActiveEffects([]);
            setAnomalyWarning(0);
            setAnomalyText(null);
            setGameState('PLAYING');
        }
    };

    const startCountdown = () => {
        setGameState('COUNTDOWN');
        setCountdown(3);
    };

    useEffect(() => {
        if (gameState === 'COUNTDOWN') {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setGameState('PLAYING');
                        engineRef.current?.resume();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameState]);

    const handleDraftSelect = (item) => {
        if (item.type === 'RELIC') {
            engineRef.current.relics.push(item.id);
            setPurchasedRelics(prev => [...prev, item]);
        } else {
            engineRef.current.activePowerup = item;
            engineRef.current.powerupCdTimer = 0;
            setActivePowerup(item);
        }
        startCountdown();
    };

    return {
        engineRef,
        boardDimensions, setBoardDimensions,
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
    };
}
