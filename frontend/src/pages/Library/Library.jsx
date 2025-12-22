import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, BookUp, BookDown, User, Plus, Edit, Trash2, History, ArrowUp, ArrowDown } from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils/dateFormatter';
import ConfirmationModal from '../../components/ConfirmationModal';

const BookForm = ({ book, onSave, onCancel }) => {
    const [formData, setFormData] = useState(book || { title: '', author: '', isbn: '', category: 'General' });
    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-sm space-y-4">
                <h2 className="text-xl font-bold">{book ? 'Edit Book' : 'Add New Book'}</h2>
                <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" className="w-full p-2 border rounded" required />
                <input name="author" value={formData.author} onChange={handleChange} placeholder="Author" className="w-full p-2 border rounded" required />
                <input name="isbn" value={formData.isbn} onChange={handleChange} placeholder="ISBN" className="w-full p-2 border rounded" />
                <input name="category" value={formData.category} onChange={handleChange} placeholder="Category" className="w-full p-2 border rounded" />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Save</button>
                </div>
            </form>
        </div>
    );
};

const IssueForm = ({ books, users, onSave, onCancel }) => {
    const [selectedBookId, setSelectedBookId] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');

    const handleSubmit = e => {
        e.preventDefault();
        if (!selectedBookId || !selectedUserId) return alert("Please select a book and a user");
        onSave({ bookId: selectedBookId, userId: selectedUserId });
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm space-y-4">
                <h2 className="text-xl font-bold">Issue a Book</h2>
                <select value={selectedBookId} onChange={e => setSelectedBookId(e.target.value)} className="w-full p-2 border rounded">
                    <option value="">-- Select Book --</option>
                    {books.filter(b => b.status === 'Available').map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
                </select>
                <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full p-2 border rounded">
                    <option value="">-- Select User --</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                </select>
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Issue</button>
                </div>
            </form>
        </div>
    );
}

const TransactionHistoryTab = ({ transactions, books, users }) => {
    const [bookFilter, setBookFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const bookMatch = !bookFilter || t.book?._id === bookFilter;
            const userMatch = !userFilter || t.user?._id === userFilter;
            return bookMatch && userMatch;
        });
    }, [transactions, bookFilter, userFilter]);

    // Create a unique list of users who have transactions for the filter dropdown
    const transactionUsers = useMemo(() => {
        const userMap = new Map();
        transactions.forEach(t => {
            if (t.user) {
                userMap.set(t.user._id, t.user);
            }
        });
        return Array.from(userMap.values());
    }, [transactions]);


    return (
        <div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600 mb-4 flex flex-wrap items-center gap-4">
                <h3 className="text-lg font-semibold">Filter History</h3>
                <div className="flex-grow">
                    <label htmlFor="book-filter" className="text-sm sr-only">Filter by Book</label>
                    <select id="book-filter" value={bookFilter} onChange={e => setBookFilter(e.target.value)} className="w-full md:w-64 p-2 border rounded-md bg-white dark:bg-gray-800">
                        <option value="">All Books</option>
                        {books.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
                    </select>
                </div>
                <div className="flex-grow">
                     <label htmlFor="user-filter" className="text-sm sr-only">Filter by User</label>
                    <select id="user-filter" value={userFilter} onChange={e => setUserFilter(e.target.value)} className="w-full md:w-64 p-2 border rounded-md bg-white dark:bg-gray-800">
                        <option value="">All Users</option>
                        {transactionUsers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                </div>
                <button 
                    onClick={() => { setBookFilter(''); setUserFilter(''); }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                    Clear Filters
                </button>
            </div>
            <Table
                headers={['Book Title', 'User', 'Type', 'Date', 'Due Date']}
                data={filteredTransactions}
                renderRow={(t) => (
                    <tr key={t._id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-3">{t.book?.title || 'N/A'}</td>
                        <td className="p-3">{t.user?.name || 'N/A'}</td>
                        <td className="p-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                t.type === 'Issue' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            }`}>
                                {t.type}
                            </span>
                        </td>
                        <td className="p-3 text-sm">{formatDateTime(t.createdAt)}</td>
                        <td className="p-3 text-sm">{t.type === 'Issue' ? formatDate(t.dueDate) : '—'}</td>
                    </tr>
                )}
            />
        </div>
    );
};


export default function Library() {
  const [activeTab, setActiveTab] = useState('books');
  const { api } = useAuth();
  const [books, setBooks] = useState([]);
  const [issued, setIssued] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]); // In a real app, this would be a searchable user list.
  const [isBookFormOpen, setIsBookFormOpen] = useState(false);
  const [isIssueFormOpen, setIsIssueFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'dueDate', direction: 'ascending' });
  const [bookFilter, setBookFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');


  useEffect(() => {
    fetchBooks();
    fetchIssuedBooks();
    fetchTransactions();
    // A simplified user fetch for the demo
    api('/api/students').then(data => setUsers(data.map(d => ({...d, role: 'Student'}))));
  }, [api]);

  const fetchBooks = async () => setBooks(await api('/api/library/books'));
  const fetchIssuedBooks = async () => setIssued(await api('/api/library/transactions/issued'));
  const fetchTransactions = async () => setTransactions(await api('/api/library/transactions/all'));

  const handleSaveBook = async (bookData) => {
    const url = editingBook ? `/api/library/books/${editingBook._id}` : '/api/library/books';
    const method = editingBook ? 'PUT' : 'POST';
    await api(url, { method, body: JSON.stringify(bookData) });
    setIsBookFormOpen(false);
    setEditingBook(null);
    fetchBooks();
  };

  const handleDeleteBook = async (bookId) => {
     setConfirmAction({
        title: 'Delete Book',
        message: 'Are you sure you want to delete this book? This action cannot be undone.',
        onConfirm: async () => {
             try {
                await api(`/api/library/books/${bookId}`, { method: 'DELETE' });
                fetchBooks();
            } catch (error) {
                alert(error.message);
            } finally {
                setConfirmAction(null);
            }
        }
    });
  };

  const handleIssueBook = async (issueData) => {
    await api('/api/library/transactions/issue', { method: 'POST', body: JSON.stringify(issueData) });
    setIsIssueFormOpen(false);
    fetchBooks();
    fetchIssuedBooks();
    fetchTransactions();
  };
  
  const handleReturnBook = async (transaction) => {
    setConfirmAction({
        title: 'Return Book',
        message: `Are you sure you want to mark "${transaction.book.title}" as returned by ${transaction.user.name}?`,
        confirmText: 'Mark as Returned',
        confirmButtonClass: 'bg-primary-600 hover:bg-primary-700',
        onConfirm: async () => {
            await api('/api/library/transactions/return', { method: 'POST', body: JSON.stringify({ transactionId: transaction._id }) });
            fetchBooks();
            fetchIssuedBooks();
            fetchTransactions();
            setConfirmAction(null);
        }
    });
  };

  const sortedIssuedBooks = useMemo(() => {
    let filteredItems = [...issued];
    
    if (bookFilter) {
        filteredItems = filteredItems.filter(item => 
            item.book.title.toLowerCase().includes(bookFilter.toLowerCase())
        );
    }
    if (studentFilter) {
        filteredItems = filteredItems.filter(item =>
            item.user.name.toLowerCase().includes(studentFilter.toLowerCase())
        );
    }

    let sortableItems = [...filteredItems];
    if (sortConfig.key) {
        sortableItems.sort((a, b) => {
            let aValue, bValue;

            if (sortConfig.key === 'user.name') {
                aValue = a.user?.name || '';
                bValue = b.user?.name || '';
                return aValue.localeCompare(bValue) * (sortConfig.direction === 'ascending' ? 1 : -1);
            } 
            
            if (sortConfig.key === 'dueDate') {
                aValue = new Date(a.dueDate);
                bValue = new Date(b.dueDate);
                return (aValue.getTime() - bValue.getTime()) * (sortConfig.direction === 'ascending' ? 1 : -1);
            }
            
            return 0; // Default return
        });
    }
    return sortableItems;
  }, [issued, sortConfig, bookFilter, studentFilter]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Library Management</h1>
      
      <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            <TabButton active={activeTab === 'books'} onClick={() => setActiveTab('books')}>All Books</TabButton>
            <TabButton active={activeTab === 'issued'} onClick={() => setActiveTab('issued')}>Issued Books</TabButton>
            <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')}>Transaction History</TabButton>
          </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'books' && (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Book Collection</h2>
                    <button onClick={() => { setEditingBook(null); setIsBookFormOpen(true); }} className="flex items-center text-sm px-3 py-1.5 bg-primary-600 text-white rounded-md"><Plus size={16} className="mr-1" />Add Book</button>
                </div>
                 <Table headers={['Title', 'Author', 'Status', 'Actions']} data={books} renderRow={(book) => (
                    <tr key={book._id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-3">{book.title}</td>
                        <td className="p-3">{book.author}</td>
                        <td className="p-3"><span className={`px-2 py-1 text-xs font-medium rounded-full ${book.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{book.status}</span></td>
                        <td className="p-3 flex gap-2">
                           <button onClick={() => { setEditingBook(book); setIsBookFormOpen(true); }} className="p-2 text-primary-600 hover:bg-primary-100 rounded-full"><Edit size={18}/></button>
                           <button onClick={() => handleDeleteBook(book._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={18}/></button>
                        </td>
                    </tr>
                 )}/>
            </div>
        )}
        {activeTab === 'issued' && (
            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Currently Issued Books</h2>
                    <button onClick={() => setIsIssueFormOpen(true)} className="flex items-center text-sm px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700"><BookUp size={16} className="mr-1" />Issue a Book</button>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600 mb-4 flex flex-wrap items-center gap-4">
                    <div className="flex-grow">
                        <input 
                            type="text"
                            placeholder="Filter by Book Title..."
                            value={bookFilter}
                            onChange={e => setBookFilter(e.target.value)}
                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                        />
                    </div>
                    <div className="flex-grow">
                        <input 
                            type="text"
                            placeholder="Filter by Student Name..."
                            value={studentFilter}
                            onChange={e => setStudentFilter(e.target.value)}
                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                        />
                    </div>
                     <button 
                        onClick={() => { setBookFilter(''); setStudentFilter(''); }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        Clear Filters
                    </button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-3 font-semibold text-sm">Book Title</th>
                                <th className="p-3 font-semibold text-sm">
                                    <button onClick={() => requestSort('user.name')} className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-200">
                                        Issued To
                                        {sortConfig.key === 'user.name' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                    </button>
                                </th>
                                <th className="p-3 font-semibold text-sm">
                                    <button onClick={() => requestSort('dueDate')} className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-200">
                                        Due Date
                                        {sortConfig.key === 'dueDate' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                                    </button>
                                </th>
                                <th className="p-3 font-semibold text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedIssuedBooks.map((item) => (
                                <tr key={item._id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-3">{item.book.title}</td>
                                    <td className="p-3">{item.user.name}</td>
                                    <td className="p-3">{formatDate(item.dueDate)}</td>
                                    <td className="p-3"><button onClick={() => handleReturnBook(item)} className="text-sm px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded">Mark as Returned</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
        {activeTab === 'history' && <TransactionHistoryTab transactions={transactions} books={books} users={users} />}
      </div>
      {isBookFormOpen && <BookForm book={editingBook} onSave={handleSaveBook} onCancel={() => setIsBookFormOpen(false)} />}
      {isIssueFormOpen && <IssueForm books={books} users={users} onSave={handleIssueBook} onCancel={() => setIsIssueFormOpen(false)} />}
      <ConfirmationModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmAction?.onConfirm}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmText={confirmAction?.confirmText}
        confirmButtonClass={confirmAction?.confirmButtonClass}
      />
    </div>
  );
}

const TabButton = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`flex items-center py-3 px-4 border-b-2 font-medium text-sm transition-colors ${active ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
      {children === 'All Books' ? <><Search size={16} className="mr-2" />{children}</> : 
       children === 'Issued Books' ? <><BookUp size={16} className="mr-2" />{children}</> :
       <><History size={16} className="mr-2" />{children}</>}
    </button>
);

const Table = ({ headers, data, renderRow }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700"><tr>{headers.map(h => <th key={h} className="p-3 font-semibold text-sm">{h}</th>)}</tr></thead>
            <tbody>{data.map(renderRow)}</tbody>
        </table>
    </div>
);