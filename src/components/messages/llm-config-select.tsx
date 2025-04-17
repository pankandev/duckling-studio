import {useChatLLMConfig} from "@/lib/client/providers/chat-llm-config";
import {useLLMConfigs} from "@/lib/client/api/llm-configs";
import {Select, SelectContent, SelectItem, SelectTrigger} from "@/components/ui/select";
import {Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Plus} from "lucide-react";
import LLMConfigCreateForm from "@/components/messages/llm-config-create-form";
import {useCallback, useState} from "react";
import {LLMConfigResource} from "@/lib/common/resources/llm-config";
import LLMConfigSelectItem from "@/components/messages/llm-config-select-item";

const LLMConfigSelect = () => {
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
                    className="flex flex-row bg-gray-600 items-center justify-center max-w-full w-[20rem]"
                >
                    {
                        store.llmConfig &&
                            <LLMConfigSelectItem config={store.llmConfig}>
                            </LLMConfigSelectItem>
                    }
                </SelectTrigger>
                <SelectContent>
                    {
                        configList.map(item => (
                            <SelectItem className="flex flex-col items-stretch" key={item.id} value={item.id.toString(10)}>
                                <LLMConfigSelectItem config={item}></LLMConfigSelectItem>
                            </SelectItem>
                        ))
                    }
                    <DialogTrigger className="w-full">
                        <div className="rounded-s h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 mt-2 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 flex flex-row items-center px-2 py-1 text-sm">
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

export default LLMConfigSelect;