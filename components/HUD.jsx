import React from 'react';
import { formatTime, getLevelBar } from '../utils/formatters';
import { LEVEL_REQ } from '../constants';

export function HUD({ stats, gameMode, setGameState, engineRef, activeEffects, activePowerup, powerupCdPct, purchasedRelics }) {
    return (
        <>
            {/* TOP HEADER */}
            <div className="h-16 border-b-2 border-[#00FF00] flex items-center justify-between px-4 text-xs md:text-base shrink-0 uppercase relative">
                <div className="flex flex-col md:flex-row md:gap-6">
                    <span>SCORE:{stats.score.toString().padStart(5, '0')}</span>
                    <span className="hidden sm:inline">UPTIME:[{formatTime(stats.timeElapsed)}]</span>
                    {gameMode !== 'ZEN' && (
                        <span className="text-[#00FFFF]">LVL:{stats.level} {getLevelBar(stats.levelProgress, LEVEL_REQ)}</span>
                    )}
                </div>

                <div className="flex flex-col text-right md:flex-row md:gap-6 items-end md:items-center">
                    <span>LEN:[{stats.length}]</span>
                    {gameMode !== 'ZEN' && (
                        <span className="text-[#FFFF00]">CREDITS:[${stats.coins}]</span>
                    )}
                    {engineRef.current && engineRef.current.isRunning && (
                        <button onClick={() => { engineRef.current.pause(); setGameState('PAUSED'); }} className="ml-2 text-sm border border-[#00FF00] px-2 py-1 hover:bg-[#00FF00] hover:text-black font-bold">
                            [||]
                        </button>
                    )}
                </div>
            </div>

            {/* BOTTOM FOOTER */}
            <div className="absolute bottom-0 w-full h-20 border-t-2 border-[#00FF00] flex items-center justify-between px-4 shrink-0 bg-black z-10">
                <div className="w-1/3 text-xs md:text-sm font-bold opacity-90 overflow-hidden whitespace-nowrap text-[#00FFFF]">
                    {activeEffects.length > 0 ? `EFFECTS: ${activeEffects.join(' ')}` : 'EFFECTS: NONE'}
                </div>

                {gameMode !== 'ZEN' && (
                    <div className="w-1/3 flex justify-center">
                        <button
                            onClick={(e) => { e.stopPropagation(); engineRef.current?.activatePowerup(); }}
                            disabled={!activePowerup}
                            className={`border-2 w-full max-w-[150px] h-12 flex flex-col items-center justify-center relative overflow-hidden transition-colors
                  ${activePowerup ? 'border-[#00FF00] text-[#00FF00] hover:bg-[#00FF00] hover:text-black cursor-pointer' : 'border-[#005500] text-[#005500]'}
                `}
                        >
                            {activePowerup && powerupCdPct > 0 && (
                                <div className="absolute left-0 bottom-0 h-full bg-[#005500] pointer-events-none" style={{ width: `${powerupCdPct * 100}%` }} />
                            )}
                            <span className="relative z-10 font-bold text-sm md:text-base">
                                {activePowerup ? `[${activePowerup.symbol}]` : 'NO_PROGRAM'}
                            </span>
                        </button>
                    </div>
                )}

                <div className="w-1/3 text-right text-xs md:text-sm flex flex-col items-end">
                    <span>LOG: {purchasedRelics.length === 0 ? 'NO_MODS' : purchasedRelics.map(r => r.symbol).join(' ')}</span>
                </div>
            </div>
        </>
    );
}
