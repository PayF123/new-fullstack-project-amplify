import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the new item form
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');

  // State for inline editing
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState({ name: '', description: '' });

  const API_URL = 'http://localhost:5000/api/items';

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    setLoading(true);
    fetch(API_URL)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        setItems(data);
        setError(null);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setError("Failed to load items. Please ensure the backend server is running.");
      })
      .finally(() => setLoading(false));
  };

  // CREATE (POST)
  const handleCreate = (e) => {
    e.preventDefault();
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newItemName, description: newItemDesc }),
    })
      .then(response => response.json())
      .then(() => {
        fetchItems(); // Refetch items to show the new one
        setNewItemName('');
        setNewItemDesc('');
      })
      .catch(error => console.error("Error creating item:", error));
  };

  // DELETE
  const handleDelete = (id) => {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(() => {
        fetchItems(); // Refetch items to reflect the deletion
      })
      .catch(error => console.error("Error deleting item:", error));
  };

  // UPDATE (PUT)
  const handleUpdate = (id) => {
    fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editText.name, description: editText.description }),
    })
      .then(() => {
        setEditingId(null); // Exit editing mode
        fetchItems(); // Refetch items
      })
      .catch(error => console.error("Error updating item:", error));
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditText({ name: item.name, description: item.description });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fullstack CRUD App</h1>
        
        <div className="card">
          <h2>Create New Item</h2>
          <form onSubmit={handleCreate}>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item Name"
              required
            />
            <input
              type="text"
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
              placeholder="Item Description"
              required
            />
            <button type="submit">Create Item</button>
          </form>
        </div>

        <h2>Items from Backend:</h2>
        <button onClick={fetchItems} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Items (GET)'}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <ul>
          {items.map(item => (
            <li key={item.id} className="item-card">
              {editingId === item.id ? (
                // Editing View
                <div className="edit-form">
                  <input
                    type="text"
                    value={editText.name}
                    onChange={(e) => setEditText({ ...editText, name: e.target.value })}
                  />
                  <input
                    type="text"
                    value={editText.description}
                    onChange={(e) => setEditText({ ...editText, description: e.target.value })}
                  />
                  <button onClick={() => handleUpdate(item.id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              ) : (
                // Normal View
                <div>
                  <strong>{item.name}</strong>: {item.description}
                  <div className="item-buttons">
                    <button onClick={() => startEditing(item)}>Edit (PUT)</button>
                    <button className="delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
