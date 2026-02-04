import React, { useState, useCallback, useEffect, useRef } from 'react';
import api from '../utils/api';
import { debounce } from '../utils/debounce';

const SearchableUserSelect = ({ value, onChange, label = 'Assign To' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get('/users/search', {
          params: { query }
        });

        if (response.data.success) {
          setUsers(response.data.data.users);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearch(query);
  }, [debouncedSearch]);

  const handleSelectUser = useCallback((user) => {
    setSelectedUser(user);
    onChange(user._id);
    setSearchTerm('');
    setUsers([]);
    setIsOpen(false);
  }, [onChange]);

  const handleClear = useCallback(() => {
    setSelectedUser(null);
    onChange('');
    setSearchTerm('');
    setUsers([]);
  }, [onChange]);

  // Load selected user data if value is provided
  useEffect(() => {
    if (value && !selectedUser) {
      const fetchUser = async () => {
        try {
          const response = await api.get(`/users/${value}`);
          if (response.data.success) {
            setSelectedUser(response.data.data.user);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };
      fetchUser();
    }
  }, [value, selectedUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className="mb-4 relative" ref={containerRef}>
      <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
        {label} (Optional)
      </label>

      <div className="relative">
        <div
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer bg-white"
          onClick={() => !selectedUser && setIsOpen(!isOpen)}
        >
          {selectedUser ? (
            <div className="flex items-center justify-between">
              <span className="text-gray-900">{selectedUser.email}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          ) : (
            <input
              type="text"
              id="assignedTo"
              placeholder="Search and select a user..."
              value={searchTerm}
              onChange={handleSearchChange}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-500"
            />
          )}
        </div>

        {isOpen && !selectedUser && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
            {loading && (
              <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
            )}

            {!loading && users.length === 0 && searchTerm && (
              <div className="px-3 py-2 text-sm text-gray-500">No users found</div>
            )}

            {!loading && users.length === 0 && !searchTerm && (
              <div className="px-3 py-2 text-sm text-gray-500">
                Start typing to search for users
              </div>
            )}

            {users.map((user) => (
              <button
                key={user._id}
                type="button"
                onClick={() => handleSelectUser(user)}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 text-sm transition-colors"
              >
                <div className="font-medium text-gray-900">{user.email}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableUserSelect;
