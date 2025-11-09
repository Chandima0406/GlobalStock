import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

/**
 * Product Edit Form - For Vendor/Admin Only
 * Allows editing of existing product details with pre-populated data
 */
const ProductEditForm = ({
  productId,
  productData,
  onSave,
  onCancel,
  isLoading = false,
  isVendor = false,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    costPrice: '',
    sku: '',
    barcode: '',
    quantity: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    category: '',
    subcategory: '',
    brand: '',
    tags: [],
    status: 'draft',
    featured: false,
    trackQuantity: true,
    allowBackorders: false,
    seoTitle: '',
    seoDescription: '',
    metaKeywords: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  // Pre-populate form when productData changes
  useEffect(() => {
    if (productData) {
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price || '',
        comparePrice: productData.comparePrice || '',
        costPrice: productData.costPrice || '',
        sku: productData.sku || '',
        barcode: productData.barcode || '',
        quantity: productData.quantity || '',
        weight: productData.weight || '',
        dimensions: productData.dimensions || { length: '', width: '', height: '' },
        category: productData.category || '',
        subcategory: productData.subcategory || '',
        brand: productData.brand || '',
        tags: productData.tags || [],
        status: productData.status || 'draft',
        featured: productData.featured || false,
        trackQuantity: productData.trackQuantity ?? true,
        allowBackorders: productData.allowBackorders || false,
        seoTitle: productData.seoTitle || '',
        seoDescription: productData.seoDescription || '',
        metaKeywords: productData.metaKeywords || []
      });

      setImagePreviews(productData.images || []);
    }
  }, [productData]);

  // Validation functions
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Product name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Product name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;

      case 'price':
        if (!value || isNaN(value) || parseFloat(value) <= 0) {
          newErrors.price = 'Valid price is required';
        } else {
          delete newErrors.price;
        }
        break;

      case 'quantity':
        if (formData.trackQuantity && (!value || isNaN(value) || parseInt(value) < 0)) {
          newErrors.quantity = 'Valid quantity is required';
        } else {
          delete newErrors.quantity;
        }
        break;

      case 'sku':
        if (!value.trim()) {
          newErrors.sku = 'SKU is required';
        } else {
          delete newErrors.sku;
        }
        break;

      case 'category':
        if (!value.trim()) {
          newErrors.category = 'Category is required';
        } else {
          delete newErrors.category;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: fieldValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: fieldValue
      }));
    }

    if (type !== 'checkbox') {
      validateField(name, fieldValue);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // Tags handling
  const handleTagsChange = (e) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  };

  // Image handling
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImagePreviews = files.map(file => ({
      id: `new-${Date.now()}-${file.name}`,
      url: URL.createObjectURL(file),
      file: file,
      isNew: true
    }));
    
    setNewImages(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newImagePreviews]);
  };

  const handleRemoveImage = (imageId) => {
    const imageToRemove = imagePreviews.find(img => img.id === imageId);
    
    if (imageToRemove.isNew) {
      setNewImages(prev => prev.filter(file => file.name !== imageToRemove.file.name));
    } else {
      setRemovedImages(prev => [...prev, imageId]);
    }
    
    setImagePreviews(prev => prev.filter(img => img.id !== imageId));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'price', 'sku', 'category'];
    let isValid = true;
    const newErrors = {};

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      }
    });

    // Price validation
    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
      isValid = false;
    }

    // Quantity validation if tracking is enabled
    if (formData.trackQuantity && (isNaN(formData.quantity) || parseInt(formData.quantity) < 0)) {
      newErrors.quantity = 'Valid quantity is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Prepare form data for submission
      const submitData = {
        ...formData,
        productId,
        images: {
          keep: imagePreviews.filter(img => !img.isNew).map(img => img.id),
          remove: removedImages,
          add: newImages
        },
        version: productData.version // For optimistic locking
      };

      const response = await onSave(submitData);
      
      if (response.success) {
        setSuccessMessage('Product updated successfully!');
        // Reset image states on successful save
        setNewImages([]);
        setRemovedImages([]);
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex justify-center items-center py-12">
          {/* Replaced Loader with inline spinner */}
          <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 w-8 h-8"></div>
          <span className="ml-3 text-gray-600">Loading product data...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
        <p className="text-gray-600 mt-1">Update product details and inventory information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Product Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.name}
                placeholder="Enter product name"
                required
              />
            </div>

            <Input
              label="SKU *"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.sku}
              placeholder="Product SKU"
              required
            />

            <Input
              label="Barcode"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              placeholder="Barcode (UPC, EAN, etc.)"
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Product description..."
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Price *"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.price}
              placeholder="0.00"
              required
            />

            <Input
              label="Compare Price"
              name="comparePrice"
              type="number"
              step="0.01"
              value={formData.comparePrice}
              onChange={handleChange}
              placeholder="Original price for strike-through"
            />

            {!isVendor && (
              <Input
                label="Cost Price"
                name="costPrice"
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={handleChange}
                placeholder="Cost price (admin only)"
              />
            )}
          </div>
        </section>

        {/* Inventory */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="trackQuantity"
                  checked={formData.trackQuantity}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Track quantity</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allowBackorders"
                  checked={formData.allowBackorders}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Allow backorders</span>
              </label>
            </div>

            {formData.trackQuantity && (
              <Input
                label="Quantity *"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.quantity}
                placeholder="0"
                required
              />
            )}
          </div>
        </section>

        {/* Images */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {imagePreviews.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt="Product preview"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
        </section>

        {/* Organization */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Category *"
              name="category"
              value={formData.category}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.category}
              placeholder="Main category"
              required
            />

            <Input
              label="Subcategory"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              placeholder="Subcategory (optional)"
            />

            <Input
              label="Brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Brand name"
            />

            <Input
              label="Tags"
              name="tags"
              value={formData.tags.join(', ')}
              onChange={handleTagsChange}
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </section>

        {/* Status & Options */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Featured product</span>
              </label>
            </div>
          </div>
        </section>

        {/* SEO */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO</h3>
          <div className="space-y-4">
            <Input
              label="SEO Title"
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleChange}
              placeholder="SEO title (optional)"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Description
              </label>
              <textarea
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="SEO description for search engines..."
              />
            </div>
          </div>
        </section>

        {/* Success Message */}
        {successMessage && (
          <Alert variant="success" message={successMessage} />
        )}

        {/* Submit Error */}
        {errors.submit && (
          <Alert variant="error" message={errors.submit} />
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting || Object.keys(errors).length > 0}
          >
            Update Product
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProductEditForm;