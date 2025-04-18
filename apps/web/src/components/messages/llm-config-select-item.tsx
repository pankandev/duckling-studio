import React from 'react';
import {LLMConfigResource} from "@/lib/common/resources/llm-config";

const LLMConfigSelectItem = (props: {config: LLMConfigResource}) => {
    return (
        <div
            className="grow flex flex-row items-center justify-between overflow-hidden gap-3">
            <span>{props.config.provider.name}</span>
            <span className="text-muted text-xs">
                {props.config.model}
            </span>
        </div>
    );
};

export default LLMConfigSelectItem;