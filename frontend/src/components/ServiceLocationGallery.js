import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ServiceLocationGallery.css';

export default function ServiceLocationGallery() {
  const { user } = useAuth();
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Check if Firebase is available
  if (!db || !storage) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Gallery Unavailable</h2>
        <p>Firebase services are not configured. This feature is disabled in backend-only mode.</p>
      </div>
    );
  }

  // Fetch media items from Firestore with proper error handling
  const fetchMediaItems = useCallback(() => {
    return new Promise((resolve, reject) => {
      try {
        setLoading(true);
        setError('');
        
        // Allow public access to gallery - no authentication required
        console.log('Fetching public gallery items...');
        
        const mediaCollection = collection(db, 'serviceGallery');
        // Fetch all public media items without user filter
        getDocs(mediaCollection).then((querySnapshot) => {
          const items = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setMediaItems(items);
          setLoading(false);
          setSuccess(`Loaded ${items.length} media items`);
          
          // Auto-clear success message
          setTimeout(() => setSuccess(''), 3000);
          resolve(items);
        }).catch((error) => {
          console.error('Error fetching media items:', error);
          setError('Failed to load media items. Please try again.');
          setLoading(false);
          setMediaItems([]);
          reject(error);
        });

      } catch (error) {
        console.error('Error fetching media items:', error);
        setError('Failed to load media items. Please try again.');
        setLoading(false);
        setMediaItems([]);
        reject(error);
      }
    });
  }, []); // Remove user dependency

  // Load media items on component mount
  useEffect(() => {
    // Public gallery - fetch items immediately without authentication check
    fetchMediaItems().catch(error => {
      console.error('Failed to load gallery items:', error);
    });
  }, [fetchMediaItems]);

  // Handle file selection with proper validation
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please select an image or video file.');
        return;
      }

      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        setError('File size too large. Maximum size is 50MB.');
        return;
      }

      setSelectedFile(file);
      setTitle(file.name.split('.')[0]);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setError('');
    }
  }, []);

  // Handle file upload with proper error handling and progress tracking
  const handleUpload = useCallback(async (e) => {
    e.preventDefault();
    
    if (!selectedFile || !title) {
      setError('Please select a file and enter a title');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      // Get current authenticated user
      const user = auth.currentUser;
      if (!user) {
        setError('Please sign in to upload media items');
        setUploading(false);
        return;
      }

      // Upload file to Firebase Storage
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const storageRef = ref(storage, `serviceGallery/${user.uid}/${fileName}`);
      
      // Create metadata
      const metadata = {
        contentType: selectedFile.type,
        customMetadata: {
          originalName: selectedFile.name,
          uploadedBy: user.uid,
          uploadedAt: new Date().toISOString(),
          title: title.trim()
        }
      };

      try {
        const uploadResult = await uploadBytes(storageRef, selectedFile, metadata);
        const downloadURL = await getDownloadURL(uploadResult.ref);
        
        // Save to Firestore
        const mediaData = {
          title: title.trim(),
          fileName: fileName,
          originalName: selectedFile.name,
          downloadURL: downloadURL,
          type: selectedFile.type.startsWith('video/') ? 'video' : 'image',
          size: selectedFile.size,
          userId: user.uid,
          createdAt: serverTimestamp(),
          tags: ['service-gallery', 'uploaded']
        };

        await addDoc(collection(db, 'serviceGallery'), mediaData);
        
        setSuccess('Media item uploaded successfully!');
        setSelectedFile(null);
        setPreview('');
        setTitle('');
        setUploadProgress(0);
        
        // Auto-clear success message
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Upload error:', error);
        setError('Upload failed: ' + error.message);
      } finally {
        setUploading(false);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed: ' + error.message);
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // Handle file input click
  const handleFileInputClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const event = { target: { files: [file] } };
      handleFileSelect(event);
    }
  }, [handleFileSelect]);

  return (
    <div className="service-location-gallery">
      <div className="gallery-header">
        <h2>Gallery</h2>
        <p>Upload and manage service location photos and videos</p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="error-message">
          <strong>❌ Error:</strong> {error}
          <button 
            onClick={() => setError('')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              padding: '4px 8px',
              marginLeft: '10px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ✕ Clear
          </button>
        </div>
      )}

      {success && (
        <div className="success-message">
          <strong>✅ Success:</strong> {success}
          <button 
            onClick={() => setSuccess('')}
            style={{
              background: 'rgba(0, 255, 136, 0.2)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              borderRadius: '4px',
              padding: '4px 8px',
              marginLeft: '10px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ✕ Clear
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading media items...</p>
        </div>
      )}

      {/* Upload Section */}
      <div className="upload-section">
        <h3>📤 Upload New Media</h3>
        <div className="upload-area" 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <div className="upload-content">
            {preview ? (
              <div className="preview-container">
                <img src={preview} alt="Preview" className="preview-image" />
                <div className="preview-info">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title..."
                    className="title-input"
                  />
                  <p className="file-info">{selectedFile.name}</p>
                </div>
              </div>
            ) : (
              <div className="upload-prompt">
                <div className="upload-icon">📁</div>
                <p>Drag & drop files here or click to select</p>
                <button onClick={handleFileInputClick} className="select-btn">
                  Select Files
                </button>
              </div>
            )}
          </div>

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p>{uploadProgress}% uploaded</p>
            </div>
          )}
        </div>

        {selectedFile && !uploading && (
          <div className="upload-actions">
            <button onClick={handleUpload} className="upload-btn" disabled={!title.trim()}>
              📤 Upload to Gallery
            </button>
            <button 
              onClick={() => {
                setSelectedFile(null);
                setPreview('');
                setTitle('');
                setError('');
              }}
              className="cancel-btn"
            >
              ✕ Cancel
            </button>
          </div>
        )}
      </div>

      <div className="media-grid">
        {mediaItems.map((item) => (
          <div key={item.id} className="media-item">
            {item.type === 'video' ? (
              <video 
                src={item.downloadURL} 
                controls 
                className="media-video"
              />
            ) : (
              <img 
                src={item.downloadURL} 
                alt={item.title}
                className="media-image"
              />
            )}
            <div className="media-info">
              <h4>{item.title}</h4>
              <p className="media-meta">
                {item.type === 'video' ? '📹 Video' : '📷 Image'} • 
                {new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}
              </p>
              <div className="media-actions">
                <button 
                  onClick={() => navigator.clipboard.writeText(item.downloadURL)}
                  className="action-btn"
                >
                  📋 Copy URL
                </button>
                <button 
                  onClick={() => window.open(item.downloadURL, '_blank')}
                  className="action-btn"
                >
                  👁️ View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mediaItems.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📸</div>
          <h3>No media items yet</h3>
          <p>Upload your first service location photo or video to get started</p>
        </div>
      )}
    </div>
  );
}
