import React from 'react';

export const TerminalMenuBox = ({ children, title }) => (
    <div className="border-2 border-[#00FF00] bg-black p-4 md:p-6 shadow-[4px_4px_0px_#00FF00] flex flex-col w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-[#00FF00] text-black font-bold px-2 py-1 mb-4 uppercase tracking-widest shrink-0">{title}</div>
        {children}
    </div>
);
