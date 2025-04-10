import {useCallback, useEffect, useRef, useState} from "react";
import MessageList from "../messages/message-list";
import MessageInput from "../messages/message-input";
import {ChatMessageResource} from "@/lib/common/resources/chat-message-resource";
import {ChatMessageInput} from "@/lib/common/types/chats";

const ChatPanel = ({onSend, disabled, messages}: {
    onSend: (input: ChatMessageInput) => unknown,
    disabled: boolean,
    messages: ChatMessageResource[]
}) => {
    const [showScrollToBottomButton, setShowScrollToBottomButton] = useState<boolean>(false);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    /**
     * Function that will show or hide the "Scroll to bottom" button based on whether
     * the messages list is scrolled to the bottom.
     */
    function checkIfShouldShowScrollToBottomButton() {
        const element = messagesContainerRef.current;
        if (!element) {
            return;
        }
        const maxScrollBottom = element.scrollHeight;
        const scrollBottom = element.scrollTop + element.clientHeight;
        const scrollMargin = 240;

        const isTooAbove = scrollBottom < maxScrollBottom - scrollMargin;
        if (isTooAbove) {
            setShowScrollToBottomButton(true);
        } else {
            setShowScrollToBottomButton(false);
        }
    }

    /**
     * On messages update, scroll to bottom
     */
    useEffect(() => {
        checkIfShouldShowScrollToBottomButton();
        scrollToBottom();
    }, [messages.length]);

    const onMessagesScroll = useCallback(() => {
        checkIfShouldShowScrollToBottomButton();
    }, []);

    /**
     * Scrolls to the bottom of the message list.
     */
    function scrollToBottom() {
        const element = messagesContainerRef.current;
        if (!element) {
            return;
        }
        element.scrollTo({behavior: "smooth", top: element.scrollHeight});
    }

    return (
        <div className="chat-container flex flex-col items-center pb-1 h-full max-h-full grow gap-3">
            {/* Messages */}
            <div
                className="chat-messages relative flex flex-col items-center pt-6 pb-1 h-full max-h-full w-full grow overflow-y-auto"
                ref={messagesContainerRef}
                onScroll={onMessagesScroll}
            >
                <div className="flex flex-col items-stretch w-full max-w-3xl grow">
                    <MessageList messages={messages}></MessageList>
                    {messages.length === 0 && (
                        <p className='text-center w-full opacity-50 mt-12'>
                            No messages
                        </p>
                    )}
                </div>
            </div>
            {/* Input */}
            <div className="chat-input relative flex flex-col items-center max-w-3xl w-full">
                {
                    showScrollToBottomButton &&
                    <div className="floating-buttons absolute top-0 -translate-y-full">
                        <button
                            onClick={scrollToBottom}
                            className="btn bg-gray-600 hover:bg-gray-700 active:bg-gray-800 px-3 py-1 rounded mb-2"
                        >
                            Go Bottom
                        </button>
                    </div>
                }
                <div className="flex flex-col items-stretch max-w-3xl w-full">
                    <MessageInput onSend={onSend} disabled={disabled}></MessageInput>
                </div>
            </div>
        </div>
    )
};

export default ChatPanel;