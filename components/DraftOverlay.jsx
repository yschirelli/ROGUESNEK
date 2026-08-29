import React from 'react';
import { TerminalMenuBox } from './TerminalMenuBox';

export function DraftOverlay({ draftOptions, handleDraftSelect }) {
    return (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 z-30">
            <TerminalMenuBox title="SYSTEM MUTATION REQUIRED">
                <div className="flex flex-col gap-3">
                    {draftOptions.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleDraftSelect(item)}
                            className="border border-[#00FF00] p-3 text-left hover:bg-[#00FF00] hover:text-black transition-colors flex flex-col md:flex-row md:items-center gap-2 group"
                        >
                            <div className="flex justify-between w-full md:w-auto md:min-w-[200px]">
                                <span className="font-bold">[{idx + 1}] {item.name}</span>
                                <span className="text-xs border px-1 border-current">{item.rarity}</span>
                            </div>
                            <span className="text-xs md:text-sm opacity-90 group-hover:opacity-100 md:ml-4">&gt; {item.desc}</span>
                        </button>
                    ))}
                </div>
            </TerminalMenuBox>
        </div>
    );
}
