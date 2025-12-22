import React, { useState } from 'react';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AcademicAdvisor = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { api } = useAuth();

    const handleAsk = async () => {
        if (!query.trim() || isLoading) return;

        setIsLoading(true);
        setError('');
        setResponse('');

        try {
            const res = await api('/api/students/academic-advisor', {
                method: 'POST',
                body: JSON.stringify({ query }),
            });
            setResponse(res.advice);
        } catch (err) {
            setError(err.message || 'Sorry, I encountered an error. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderResponse = (text) => {
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

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-full flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                <Sparkles className="mr-3 text-primary-500" />
                AI Academic Advisor
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Ask questions about your academic performance, subject choices, or study strategies. For example: "Based on my grades, what subjects should I focus on?"
            </p>
            <div className="flex items-center gap-4 mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                    placeholder="Ask me anything about your academics..."
                    className="flex-grow p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={isLoading}
                />
                <button
                    onClick={handleAsk}
                    disabled={isLoading || !query.trim()}
                    className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-400"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
                </button>
            </div>
            {(response || error || isLoading) && (
                 <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex-grow">
                    {isLoading && <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin h-5 w-5" /> Analyzing your profile...</div>}
                    {error && <div className="text-red-500">{error}</div>}
                    {response && (
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center mt-1"><Bot size={20}/></div>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                {renderResponse(response)}
                            </div>
                        </div>
                    )}
                 </div>
            )}
        </div>
    );
};

export default AcademicAdvisor;