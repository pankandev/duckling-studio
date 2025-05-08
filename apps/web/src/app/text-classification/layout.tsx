import React from 'react';

const TextClassificationLayout = ({children}: {children: React.ReactNode}) => {
    return (
        <div className="flex flex-col items-stretch w-full gap-2">
            <div className="flex flex-row items-center justify-between py-3 px-5">
                <div className="flex flex-row">
                    <h1 className="font-bold">Text Classification</h1>
                </div>
            </div>
            <div className="py-3 px-5">
                {children}
            </div>
        </div>
    );
};

export default TextClassificationLayout;