import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const renderMessageContent = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let listItems = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(<ul key={`ul-${elements.length}`} className="list-disc pl-5 my-2 space-y-1">{listItems}</ul>);
            listItems = [];
        }
    };

    lines.forEach((line, index) => {
        const bolded = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        if (line.trim().startsWith('* ')) {
            listItems.push(<li key={index} dangerouslySetInnerHTML={{ __html: bolded.substring(line.indexOf('* ') + 2) }} />);
        } else {
            flushList();
            if (line.trim().startsWith('#')) {
                const level = line.match(/^#+/)[0].length;
                const content = line.replace(/^#+/, '').trim();
                const Tag = `h${Math.min(level + 2, 6)}`; // h3, h4, etc.
                elements.push(<Tag className="font-bold my-2" key={index} dangerouslySetInnerHTML={{ __html: content }} />);
            } else if (line.trim()) {
                elements.push(<p key={index} dangerouslySetInnerHTML={{ __html: bolded }} />);
            }
        }
    });

    flushList(); // Flush any remaining list items at the end
    return elements;
};

const ChatMessage = ({ message, role }) => {
    const isUser = role === 'user';
    return (
        <div className={`flex items-start gap-4 my-4 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center"><Bot /></div>}
            <div className={`p-4 rounded-xl max-w-lg prose prose-sm dark:prose-invert ${isUser ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {renderMessageContent(message)}
            </div>
             {isUser && <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 flex items-center justify-center"><User /></div>}
        </div>
    );
};


export default function CareerHub() {
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Hello! I'm your AI Career Counselor. How can I help you plan your future today? Ask me about career paths, skills to learn, or job roles that fit your profile." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { api } = useAuth();
    const chatContainerRef = useRef(null);

    useEffect(() => {
        chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError('');

        try {
            const response = await api('/api/career/ask-ai', {
                method: 'POST',
                body: JSON.stringify({ query: input }),
            });
            const aiMessage = { role: 'ai', text: response.answer };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            const errorMessage = { role: 'ai', text: `Sorry, I encountered an error: ${err.message}` };
            setMessages(prev => [...prev, errorMessage]);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-xl shadow-lg h-full flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                <Sparkles className="mr-3 text-primary-500" /> AI Career Counselor
            </h1>
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-4 -mr-4 mb-4 border-b dark:border-gray-700 pb-4">
                {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg.text} role={msg.role} />
                ))}
                {isLoading && (
                     <div className="flex items-start gap-4 my-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center"><Bot /></div>
                        <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center">
                            <Loader2 className="animate-spin h-5 w-5 mr-2" /> Typing...
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="e.g., What jobs can I get with my skills?"
                    className="flex-grow p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-400"
                >
                    <Send />
                </button>
            </div>
        </div>
    );
}