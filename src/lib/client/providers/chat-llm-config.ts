import {create} from "zustand/react";
import {persist} from "zustand/middleware";
import {LLMConfigResource} from "@/lib/common/resources/llm-config";
import {useLLMConfigs} from "@/lib/client/api/llm-configs";


interface RawChatConfigStore {
    fallbackLLMConfigId: number | null;
    currentLLMConfigId: number | null;

    setCurrentLLMConfigId: (id: number) => void;
    getLLMConfigId: () => number | null;
}

export interface ChatConfigStore {
    llmConfig: LLMConfigResource | null;
    isFallback: boolean;
    setCurrentLLMConfigId: (id: number) => void;
}

export const useRawChatConfigStore = create(
    persist(
        (set, get: () => RawChatConfigStore): RawChatConfigStore => ({
            fallbackLLMConfigId: null,
            currentLLMConfigId: null,
            setCurrentLLMConfigId: (id: number | null)=> {
                if (id !== null) {
                    set({
                        fallbackLLMConfigId: id,
                        currentLLMConfigId: id
                    });
                } else {
                    set({
                        fallbackLLMConfigId: id,
                    })
                }
            },
            getLLMConfigId: () => {
                const current = get();
                return current.currentLLMConfigId ?? current.fallbackLLMConfigId;
            },
        }),
        {
            name: 'chat-config-store',
            partialize: (state): Pick<RawChatConfigStore, 'fallbackLLMConfigId' | 'currentLLMConfigId'> => ({
                fallbackLLMConfigId: state.fallbackLLMConfigId,
                currentLLMConfigId: state.currentLLMConfigId,
            })
        }
    ),
);


export function useChatLLMConfig(): ChatConfigStore {
    const store = useRawChatConfigStore();
    const configResult = useLLMConfigs();

    let config: LLMConfigResource | null = null;
    if (configResult.data?.success) {
        config = configResult.data.value.find(
            configItem => configItem.id === store.currentLLMConfigId
        ) ?? null;
    }

    return {
        llmConfig: config,
        isFallback: store.fallbackLLMConfigId === store.currentLLMConfigId,
        setCurrentLLMConfigId: store.setCurrentLLMConfigId
    }
}