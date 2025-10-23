import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../../../api'; // Import api helper

const ImageUpload = ({ property, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [imageType, setImageType] = useState('regular'); // 'regular', 'panorama', 'virtualTour'

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Fetch existing images for this property
  useEffect(() => {
    const fetchImages = async () => {
      if (!property?._id) return;
      
      setLoading(true);
      try {
        // Use the API client instead of direct fetch
        const response = await fetch(`${api.baseUrl}/properties/${property._id}/images`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch images');
        
        const data = await response.json();
        setImages(data);
      } catch (error) {
        console.error('Error fetching images:', error);
        toast.error('Failed to load images');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [property]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    if (!file.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !property?._id) return;

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('isPrimary', isPrimary);
      formData.append('imageType', imageType);
      
      // Get auth headers but DON'T include Content-Type for FormData
      const headers = getAuthHeaders();
      
      const response = await fetch(`${api.baseUrl}/properties/${property._id}/images`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include' // Add this for CORS
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const newImage = await response.json();
      setImages([...images, newImage]);
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl('');
      setIsPrimary(false);
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }
    
    try {
      // Use full API URL instead of relative path
      const response = await fetch(`${api.baseUrl}/properties/${property._id}/images/${imageId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete image');
      
      setImages(images.filter(img => img._id !== imageId));
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            Manage Images: {property?.title || 'Property'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  disabled={uploading}
                />
              </div>
              
              {previewUrl && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Preview</p>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full max-h-40 object-cover rounded border border-gray-200" 
                  />
                </div>
              )}
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Image Type</label>
                <select
                  value={imageType}
                  onChange={(e) => setImageType(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={uploading}
                >
                  <option value="regular">Regular Property Image</option>
                  <option value="panorama">Panorama (360° View)</option>
                  <option value="virtualTour">Virtual Tour Image</option>
                </select>
                
                {imageType !== 'regular' && (
                  <p className="text-xs text-gray-500 mt-1">
                    For best results, use equirectangular panorama images with a 2:1 aspect ratio.
                  </p>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  disabled={uploading}
                />
                <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-900">
                  Set as primary image
                </label>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    'Upload Image'
                  )}
                </button>
              </div>
            </div>
          </form>
          
          {/* Existing Images */}
          <div>
            <h3 className="text-lg font-medium mb-3">Current Images</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <svg className="animate-spin mx-auto h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {images.map((image, index) => (
                  <div key={image._id || index} className="relative group">
                    <div className="aspect-w-4 aspect-h-3">
                      <img
                        src={image.imagePath}
                        alt={image.altText || "Property image"}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => handleDeleteImage(image._id)}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded-md">
                        Primary
                      </div>
                    )}
                    
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md">
                      {image.imageType}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-md">
                No images uploaded yet for this property.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;