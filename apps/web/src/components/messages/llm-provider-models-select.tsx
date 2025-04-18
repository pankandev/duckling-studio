import React from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {useLLMProviders} from "@/lib/client/api/llm-configs";
import { Alert } from '../ui/alert';


const LLMProviderModelsSelect = ({providerHandle, name}: { providerHandle: string | null, name: string }) => {
    const providers = useLLMProviders();
    if (providers.data !== undefined && !providers.data.success) {
        return
    }

    const provider = providers.data?.value.find(p => p.handle === providerHandle);

    const models = provider?.models ?? [];

    return (
        <div className="flex flex-col items-stretch gap-3">
            <Select name={name} disabled={models.length === 0}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a model..."/>
                </SelectTrigger>
                <SelectContent className="w-full">
                    {models.map((item) => (
                        <SelectItem className="w-full" key={item.id} value={item.id}>
                            <div
                                className="flex flex-row items-center justify-between overflow-hidden gap-3 w-full">
                                <span className="grow">{item.name}</span>
                                <span className="text-muted text-xs">{item.id}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {
                models.length === 0 && (
                    <Alert variant="destructive" className="w-full flex flex-col items-stretch">
                        This LLM provider is not properly configured.
                    </Alert>
                )
            }
        </div>
    );
};

export default LLMProviderModelsSelect;