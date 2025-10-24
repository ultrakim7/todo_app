
import React, { useState, useMemo, useEffect } from 'react';
import type { Todo } from './types';

// Helper Icon Components (defined outside the main component)
const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);


// Main App Component
const App: React.FC = () => {
    const [todos, setTodos] = useState<Todo[]>(() => {
        try {
            const localData = localStorage.getItem('todos');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("로컬 스토리지에서 할 일 목록을 불러오는 데 실패했습니다:", error);
            return [];
        }
    });
    const [newTodo, setNewTodo] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState<string>('');

    useEffect(() => {
        try {
            localStorage.setItem('todos', JSON.stringify(todos));
        } catch (error) {
            console.error("로컬 스토리지에 할 일 목록을 저장하는 데 실패했습니다:", error);
        }
    }, [todos]);

    const handleAddTodo = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTodo.trim() === '') return;
        const todo: Todo = {
            id: Date.now(),
            text: newTodo.trim(),
            completed: false,
            createdAt: Date.now(),
        };
        setTodos(prevTodos => [todo, ...prevTodos]);
        setNewTodo('');
    };
    
    const handleToggleComplete = (id: number) => {
        setTodos(prevTodos =>
            prevTodos.map(todo =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
    };

    const handleDeleteTodo = (id: number) => {
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    };

    const handleClearAll = () => {
        setTodos([]);
    };
    
    const handleStartEditing = (todo: Todo) => {
        setEditingId(todo.id);
        setEditingText(todo.text);
    };

    const handleCancelEditing = () => {
        setEditingId(null);
        setEditingText('');
    };

    const handleUpdateTodo = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingText.trim() === '') return;
        setTodos(prevTodos =>
            prevTodos.map(todo =>
                todo.id === editingId ? { ...todo, text: editingText.trim() } : todo
            )
        );
        handleCancelEditing();
    };

    const filteredAndSortedTodos = useMemo(() => {
        return todos
            .filter(todo =>
                todo.text.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                }
                return b.createdAt - a.createdAt;
            });
    }, [todos, searchTerm]);

    return (
        <div className="bg-slate-100 min-h-screen font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
                <header className="text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">모던 TODO List</h1>
                    <p className="text-slate-500 mt-2">오늘의 할 일을 관리하세요</p>
                </header>
                
                <form onSubmit={handleAddTodo} className="flex space-x-2">
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="새로운 할 일을 입력하세요..."
                        className="flex-grow p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    />
                    <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        추가
                    </button>
                </form>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="relative flex-grow">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                           <SearchIcon className="w-5 h-5" />
                        </span>
                        <input
                            type="text"
                            placeholder="할 일 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 pl-10 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200"
                        />
                    </div>
                    {todos.length > 0 && (
                        <button onClick={handleClearAll} className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            모두 지우기
                        </button>
                    )}
                </div>

                <div className="max-h-[22.5rem] overflow-y-auto pr-2 space-y-3">
                    {filteredAndSortedTodos.length > 0 ? (
                        filteredAndSortedTodos.map(todo => (
                            <div key={todo.id} className={`p-4 rounded-lg flex items-center transition-all duration-300 ${todo.completed ? 'bg-slate-50' : 'bg-white shadow-sm'}`}>
                                {editingId === todo.id ? (
                                    <form onSubmit={handleUpdateTodo} className="flex-grow flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={editingText}
                                            onChange={(e) => setEditingText(e.target.value)}
                                            className="flex-grow p-2 border border-indigo-300 rounded-md"
                                            autoFocus
                                        />
                                        <button type="submit" className="text-green-600 hover:text-green-800 font-semibold">저장</button>
                                        <button type="button" onClick={handleCancelEditing} className="text-slate-500 hover:text-slate-700">취소</button>
                                    </form>
                                ) : (
                                    <>
                                        <input
                                            type="checkbox"
                                            checked={todo.completed}
                                            onChange={() => handleToggleComplete(todo.id)}
                                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                        <span className={`flex-grow mx-4 text-slate-700 ${todo.completed ? 'line-through text-slate-400' : ''}`}>
                                            {todo.text}
                                        </span>
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => handleStartEditing(todo)} className="text-slate-400 hover:text-sky-600 transition duration-200">
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDeleteTodo(todo.id)} className="text-slate-400 hover:text-red-600 transition duration-200">
                                                <DeleteIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-8 text-slate-500">
                            <p>할 일이 없습니다. 새 항목을 추가해보세요!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
