import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getAllUsers } from '../lib/api';
import { useChatStore } from '../store/chatStore';
import UserSearch from '../components/shared/UserSearch';
import UserList from '../components/shared/UserList';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { accessChat } = useChatStore();

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getAllUsers();
        if (response.success) {
          setUsers(response.users);
          setFilteredUsers(response.users);
        } else {
          setError('Failed to fetch users');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('An error occurred while fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle search locally if we already have all users
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        user.name?.toLowerCase().includes(query) || 
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  // Handle user selection (start chat)
  const handleUserSelect = async (user) => {
    try {
      setLoading(true);
      const chat = await accessChat(user._id);
      if (chat) {
        toast.success(`Chat with ${user.name || user.username} started`);
        navigate(`/chat/${chat._id}`);
      }
    } catch (err) {
      console.error('Error starting chat:', err);
      toast.error('Failed to start chat');
    } finally {
      setLoading(false);
    }
  };

  // Handle search from the search component
  const handleSearch = (user) => {
    // If a user is selected from search dropdown, start chat
    handleUserSelect(user);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Users</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Find users and start a conversation
        </p>
      </div>

      {/* Search bar */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <UserSearch 
          onSelectUser={handleSearch}
          placeholder="Search users by name or username..."
        />
        <div className="mt-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter users..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            {error}
          </div>
        ) : (
          <UserList 
            users={filteredUsers}
            onUserSelect={handleUserSelect}
          />
        )}
      </div>
    </div>
  );
};

export default Users; 