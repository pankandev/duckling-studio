'use client';

import React, {useCallback} from 'react';
import {LLMConfigCreate, LLMConfigResource, LLMConfigSchema} from "@/lib/common/resources/llm-config";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useLLMConfigs, useLLMProviders} from "@/lib/client/api/llm-configs";
import {z} from "zod";
import {Input} from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import FormGroup from "@/components/form/form-group";
import { Button } from '@/components/ui/button';
import {apiPost} from "@/lib/client/api/client";
import {buildRestResponseSingleItemSchema} from "@/lib/common/http/rest-schema";

const LLMConfigCreateForm = ({onCreate}: { onCreate: (config: LLMConfigResource) => unknown }) => {
    const configProvidersResult = useLLMProviders();
    const {mutate: mutateConfigs} = useLLMConfigs();
    const configProviders = configProvidersResult.data?.success ? configProvidersResult.data.value : [];

    const submit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const parseResult = z.object({
            provider: z.string(),
            model: z.string()
        }).safeParse(Object.fromEntries(formData.entries()));
        if (!parseResult.success) {
            return;
        }
        const requestBody: LLMConfigCreate = {
            providerHandle: parseResult.data.provider,
            model: parseResult.data.model
        };

        const result = await apiPost({
            responseSchema: buildRestResponseSingleItemSchema(LLMConfigSchema),
            url: '/api/v1/llm-configs',
            body: requestBody
        });
        if (!result.success) {
            return;
        }

        await mutateConfigs();
        onCreate(result.value.item);
    }, [mutateConfigs, onCreate]);

    return (
        <form onSubmit={submit} className="flex flex-col gap-5 items-stretch">
            <FormGroup>
                <Label htmlFor="provider">Provider</Label>
                <Select name="provider">
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a provider..."/>
                    </SelectTrigger>
                    <SelectContent>
                        {configProviders.map(provider => (
                            <SelectItem key={provider.handle} value={provider.handle}>
                                {provider.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </FormGroup>
            <FormGroup>
                <Label htmlFor="model">Model Name</Label>
                <Input id="model" name="model" type="text" placeholder="Model Name"/>
            </FormGroup>
            <Button className="mt-5" type="submit">
                Create
            </Button>
        </form>
    );
};

export default LLMConfigCreateForm;