import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const VirtualTourUpload = ({ property, onClose }) => {
  const [panoramaImages, setPanoramaImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      if (!property?._id) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/properties/${property._id}/virtual-tour`);
        if (response.ok) {
          const data = await response.json();
          setPanoramaImages(data);
        }
      } catch (error) {
        console.error('Error fetching virtual tour images:', error);
        toast.error('Failed to load virtual tour images');
      } finally {
        setLoading(false);
      }
    };

    if (property?._id) {
      fetchImages();
    }
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedFile || !property?._id) {
      toast.error('Please select an image file first');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('isPrimary', isPrimary);
      formData.append('imageType', 'panorama');
      formData.append('hotspots', JSON.stringify(hotspots));
      
      const response = await fetch(`/api/properties/${property._id}/virtual-tour`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      // Add the new image to the list
      const newImage = await response.json();
      setPanoramaImages([...panoramaImages, newImage]);
      
      // Clear form
      setSelectedFile(null);
      setPreviewUrl('');
      setIsPrimary(false);
      setHotspots([]);
      
      // Show success message
      toast.success('Virtual tour image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Failed to upload: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this virtual tour image?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/properties/${property._id}/virtual-tour/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete virtual tour image');
      
      setPanoramaImages(panoramaImages.filter(img => img._id !== imageId));
      toast.success('Virtual tour image deleted successfully');
    } catch (error) {
      console.error('Error deleting virtual tour image:', error);
      toast.error('Failed to delete virtual tour image');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            Virtual Tour: {property?.title || 'Property'}
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
              <label className="block">
                <span className="text-gray-700">Upload 360° Panorama Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: For best results, use equirectangular panorama images with a 2:1 aspect ratio.
                </p>
              </label>
              
              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Preview</p>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full max-h-40 object-cover rounded border border-gray-300" 
                  />
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                  disabled={uploading}
                />
                <label htmlFor="isPrimary" className="ml-2 text-sm text-gray-700">
                  Set as primary virtual tour image
                </label>
              </div>
              
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
          </form>
          
          {/* Existing Images */}
          <div>
            <h3 className="text-lg font-medium mb-3">Current Virtual Tour Images</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <svg className="animate-spin mx-auto h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : panoramaImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {panoramaImages.map((image) => (
                  <div key={image._id} className="relative border rounded-lg overflow-hidden bg-gray-50">
                    <div className="relative aspect-[2/1]">
                      <img
                        src={image.imagePath}
                        alt="Virtual tour view"
                        className="w-full h-full object-cover"
                      />
                      {image.isPrimary && (
                        <span className="absolute top-2 left-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                      <button 
                        onClick={() => handleDeleteImage(image._id)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-500">
                        Uploaded: {new Date(image.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-md">
                No virtual tour images uploaded yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTourUpload;