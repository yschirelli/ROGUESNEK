import React from 'react';
import { TerminalMenuBox } from './TerminalMenuBox';

export function Shop({ stats, setStats, engineRef, activePowerup, shopSessionBorderPurchases, setShopSessionBorderPurchases, startCountdown }) {

    const getHealCost = () => Math.floor(10 * (engineRef.current?.inflation || 1));
    const getUpgradeCost = () => Math.floor(20 * (engineRef.current?.inflation || 1));
    const getBorderCost = () => Math.floor(30 * (engineRef.current?.inflation || 1) * Math.pow(1.5, shopSessionBorderPurchases));

    const buyHeal = () => {
        const cost = getHealCost();
        if (stats.coins >= cost) {
            engineRef.current.stats.coins -= cost;
            engineRef.current.pendingGrowth += 5;
            setStats({ ...stats, coins: engineRef.current.stats.coins });
        }
    };

    const buyUpgrade = () => {
        const cost = getUpgradeCost();
        if (stats.coins >= cost && activePowerup) {
            engineRef.current.stats.coins -= cost;
            engineRef.current.activePowerup.cd *= 0.8;
            setStats({ ...stats, coins: engineRef.current.stats.coins });
        }
    };

    const buyBorder = () => {
        const cost = getBorderCost();
        if (stats.coins >= cost && engineRef.current.canEnlargeBorder()) {
            engineRef.current.stats.coins -= cost;
            if (engineRef.current.enlargeBorder()) {
                setShopSessionBorderPurchases(prev => prev + 1);
                setStats({ ...stats, coins: engineRef.current.stats.coins });
            }
        }
    };

    return (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 z-30">
            <TerminalMenuBox title="MERCHANT NODE CONNECTED">
                <div className="flex flex-col gap-4 mb-6">
                    <button
                        onClick={buyHeal}
                        disabled={stats.coins < getHealCost()}
                        className="border border-[#FFFF00] text-[#FFFF00] p-4 text-left hover:bg-[#FFFF00] hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#FFFF00] transition-colors flex justify-between items-center"
                    >
                        <div className="flex flex-col">
                            <span>[1] REPAIR_INTEGRITY</span>
                            <span className="text-xs opacity-80">&gt; INCREASE +5 IN LENGTH</span>
                        </div>
                        <span>[${getHealCost()}]</span>
                    </button>

                    <button
                        onClick={buyUpgrade}
                        disabled={stats.coins < getUpgradeCost() || !activePowerup}
                        className="border border-[#00FFFF] text-[#00FFFF] p-4 text-left hover:bg-[#00FFFF] hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#00FFFF] transition-colors flex justify-between items-center"
                    >
                        <div className="flex flex-col">
                            <span>[2] OVERCLOCK_ACTIVE</span>
                            <span className="text-xs opacity-80">&gt; REDUCE POWERUP COOLDOWN BY 20%</span>
                        </div>
                        <span>[${getUpgradeCost()}]</span>
                    </button>

                    <button
                        onClick={buyBorder}
                        disabled={stats.coins < getBorderCost() || !(engineRef.current?.canEnlargeBorder())}
                        className="border border-[#FF00FF] text-[#FF00FF] p-4 text-left hover:bg-[#FF00FF] hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#FF00FF] transition-colors flex justify-between items-center"
                    >
                        <div className="flex flex-col">
                            <span>[3] ENLARGE_BORDER</span>
                            <span className="text-xs opacity-80">&gt; PUSH BACK THE LEVEL BORDERS (PRICE INCREASES EVERY PURCHASE)</span>
                        </div>
                        <span>{engineRef.current?.canEnlargeBorder() ? `[$${getBorderCost()}]` : '[LIMIT_REACHED]'}</span>
                    </button>
                </div>

                <button onClick={startCountdown} className="text-left border border-[#00FF00] p-4 hover:bg-[#00FF00] hover:text-black font-bold">
                    [4] DISCONNECT AND CONTINUE
                </button>
            </TerminalMenuBox>
        </div>
    );
}
