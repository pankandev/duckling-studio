import React, {ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState} from 'react';

const TextArea = (
    {
        id,
        value,
        onChange,
        onSubmitRequest,
        onEscape,
        disabled,
        onBlur,
        className,
    }: {
        id?: string,
        className?: string,
        value?: string,
        onChange?: (v: string) => unknown,
        onSubmitRequest?: (value: string) => unknown,
        onEscape?: () => void,
        onBlur?: (v: string) => void,
        disabled?: boolean,
    },
) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [innerText, setInnerText] = useState(value ?? '');

    function adjustTextAreaSize(textArea: HTMLTextAreaElement) {
        textArea.style.height = 'auto'; // reset height
        textArea.style.height = `${textArea.scrollHeight}px`; // set to scroll height
    }

    useEffect(() => {
        const textArea = textareaRef.current;
        if (textArea !== null) {
            adjustTextAreaSize(textArea);
        }
    }, [innerText])

    useEffect(() => {
        if (value !== undefined) {
            setInnerText(value);
        }
    }, [value]);

    useEffect(() => {
        const textArea = textareaRef.current;
        if (textArea !== null) {
            textArea.focus();
        }
    }, []);

    const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e.target.value);
        setInnerText(e.target.value);
    }, [onChange]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.shiftKey && e.key === 'Enter') {
            e.preventDefault();
            onSubmitRequest?.(e.currentTarget.value);
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            onEscape?.();
        }
    }, [onEscape, onSubmitRequest]);

    const onBlurInner = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        if (onBlur !== undefined) {
            e.preventDefault();
            onBlur(innerText);
        }
    }, [onBlur, innerText]);

    return (
        <textarea
            id={id}
            name={id}
            ref={textareaRef}
            value={innerText}
            onChange={handleChange}
            onBlur={onBlurInner}
            className={'flex flex-row items-center resize-none overflow-hidden border p-2 rounded ' +className}
            onKeyDown={handleKeyDown}
            disabled={disabled}
        >
        </textarea>
    );
};

export default TextArea;