import {useChatLLMConfig} from "@/lib/client/providers/chat-llm-config";
import {useLLMConfigs} from "@/lib/client/api/llm-configs";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "../ui/button";
import {Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Plus} from "lucide-react";
import LLMConfigCreateForm from "@/components/messages/llm-config-create-form";
import {useCallback, useState} from "react";
import {LLMConfigResource} from "@/lib/common/resources/llm-config";

const LLMConfigSelectIcon = () => {
    const configListResult = useLLMConfigs();
    const configList = configListResult.data?.success ? configListResult.data.value : [];
    const store = useChatLLMConfig();

    const [openCreateForm, setOpenCreateForm] = useState<boolean>(false);

    const onConfigCreate = useCallback((config: LLMConfigResource) => {
        store.setCurrentLLMConfigId(config.id);
        setOpenCreateForm(false);
    }, [store]);

    return (
        <Dialog open={openCreateForm} onOpenChange={setOpenCreateForm}>
            <Select onValueChange={(id) => store.setCurrentLLMConfigId(parseInt(id))}>
                <SelectTrigger
                    className="flex flex-row w-[5rem] min-h-full p-0 bg-gray-600 border-none rounded-none rounded-l-2xl items-center justify-center"
                >
                    <div
                        className="grow flex flex-col items-center max-w-[3rem] overflow-hidden">
                        {
                            store.llmConfig ? (
                                <>
                                    <div>
                                        {store.llmConfig.provider.handle}
                                    </div>
                                    <div className="text-ellipsis whitespace-nowrap text-nowrap text-muted text-xs">
                                        {store.llmConfig.model}
                                    </div>
                                </>) : <>None</>
                        }
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {
                        configList.map(item => (
                            <SelectItem key={item.id} value={item.id.toString(10)}>
                                <div className="flex flex-row items-center">
                                    {item.provider.handle}: {item.model}
                                </div>
                            </SelectItem>
                        ))
                    }
                    <DialogTrigger>
                        <div className="flex flex-row items-center px-2 py-1">
                            <Plus className="h-4 w-4 mr-2"/>
                            Create new config...
                        </div>
                    </DialogTrigger>
                </SelectContent>
            </Select>

            <DialogContent>
                <DialogTitle title="Create new LLM config"></DialogTitle>
                <DialogDescription content="Form to create a new LLM configuration"></DialogDescription>
                <div className="flex flex-col items-center mb-7">
                    <div className="flex flex-col items-stretch w-full max-w-sm gap-2">
                        <h2 className="font-bold mb-2">Create LLM Config</h2>
                        <LLMConfigCreateForm onCreate={onConfigCreate}></LLMConfigCreateForm>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LLMConfigSelectIcon;