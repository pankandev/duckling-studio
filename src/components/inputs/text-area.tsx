import React, {ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState} from 'react';

const TextArea = (
    {
        value,
        onChange,
        onCancel,
        disabled,
    }: {
        value: string,
        onChange: (v: string) => unknown,
        onCancel: () => void,
        disabled: boolean,
    },
) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [innerText, setInnerText] = useState(value);

    function adjustTextAreaSize(textArea: HTMLTextAreaElement) {
        textArea.style.height = 'auto'; // reset height
        textArea.style.height = `${textArea.scrollHeight + 4}px`; // set to scroll height
    }

    useEffect(() => {
        const textArea = textareaRef.current;
        if (textArea !== null) {
            adjustTextAreaSize(textArea);
        }
    }, [innerText])

    useEffect(() => {
        const textArea = textareaRef.current;
        if (textArea !== null) {
            textArea.focus();
        }
    }, []);

    const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        setInnerText(e.target.value);
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.shiftKey && e.key === 'Enter') {
            e.preventDefault();
            onChange(e.currentTarget.value);
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
        }
    }, [onCancel, onChange]);

    const onBlur = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        onChange(e.currentTarget.value);
    }, [onChange]);

    return (
        <textarea
            ref={textareaRef}
            value={innerText}
            onChange={handleChange}
            onBlur={onBlur}
            className="resize-none overflow-hidden border border-gray-600 p-2 rounded"
            onKeyDown={handleKeyDown}
            disabled={disabled}
        >
        </textarea>
    );
};

export default TextArea;