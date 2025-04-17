import React from 'react';

const FormGroup = ({children}: {children: React.ReactNode}) => {
    return (
        <div className="form-group flex flex-col items-stretch gap-1.5">
            {children}
        </div>
    );
};

export default FormGroup;