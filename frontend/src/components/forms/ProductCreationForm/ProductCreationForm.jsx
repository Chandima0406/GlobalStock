import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button'; 
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card'; 
import Alert from '@/components/ui/Alert'; 

const ProductCreationForm = ({ onProductCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(''); 
  const [categories, setCategories] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    comparePrice: '',
    costPrice: '',
    
    // Category & Classification
    category: '',
    subcategory: '',
    brand: '',
    tags: '',
    
    // Inventory
    inventory: {
      quantity: '',
      lowStockAlert: 10,
      trackQuantity: true,
      allowBackorder: false,
      sku: '',
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: '',
        unit: 'cm'
      }
    },
    
    // Status & Features
    status: 'draft',
    isFeatured: false,
    isDigital: false,
    isPublished: true,
    
    // Specifications
    specifications: {},
    features: [],
    
    // Shipping
    shipping: {
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: ''
      },
      isFreeShipping: false,
      shippingClass: ''
    },
    
    // Warranty
    warranty: {
      hasWarranty: false,
      period: '',
      description: ''
    },
    
    // Variants
    hasVariants: false,
    variants: [],
    options: [],
    
    // Images
    images: []
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Auto-generate SKU
  useEffect(() => {
    if (!formData.inventory.sku && formData.brand && formData.name) {
      const brandPrefix = formData.brand.substring(0, 3).toUpperCase();
      const nameCode = formData.name.substring(0, 3).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const generatedSKU = `${brandPrefix}-${nameCode}-${random}`; 
      
      setFormData(prev => ({
        ...prev,
        inventory: {
          ...prev.inventory,
          sku: generatedSKU
        }
      }));
    }
  }, [formData.brand, formData.name, formData.inventory.sku]);

  // Validation functions
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Product name is required';
        } else if (value.length < 3 || value.length > 100) {
          newErrors.name = 'Product name must be between 3-100 characters';
        } else {
          delete newErrors.name;
        }
        break;

      case 'description':
        if (!value.trim()) {
          newErrors.description = 'Product description is required';
        } else if (value.length < 10) {
          newErrors.description = 'Description must be at least 10 characters';
        } else {
          delete newErrors.description;
        }
        break;

      case 'price':
        if (!value || parseFloat(value) <= 0) {
          newErrors.price = 'Price must be greater than 0';
        } else {
          delete newErrors.price;
        }
        break;

      case 'category':
        if (!value) {
          newErrors.category = 'Category is required';
        } else {
          delete newErrors.category;
        }
        break;

      case 'inventory.quantity':
        if (value === '' || parseInt(value) < 0) {
          newErrors.inventory = { ...newErrors.inventory, quantity: 'Stock quantity cannot be negative' };
        } else {
          delete newErrors.inventory?.quantity;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      
      if (subChild) {
        // Three levels deep 
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subChild]: type === 'checkbox' ? checked : value
            }
          }
        }));
      } else {
        // Two levels deep (e.g., inventory.quantity)
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }));
      }
    } else {
      // Top level fields
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Validate field on change
    if (type !== 'checkbox' && type !== 'file') {
      validateField(name, value);
    }

    // Handle file uploads
    if (type === 'file' && files) {
      handleImageUpload(files);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleImageUpload = (files) => {
    const newErrors = { ...errors };
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    const maxImages = 5;

    // Check total images count
    if (formData.images.length + files.length > maxImages) {
      newErrors.images = `Maximum ${maxImages} images allowed`; 
      setErrors(newErrors);
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    Array.from(files).forEach(file => {
      // Check file type
      if (!validTypes.includes(file.type)) {
        newErrors.images = 'Only JPG, PNG, and WebP images are allowed';
        return;
      }

      // Check file size
      if (file.size > maxSize) {
        newErrors.images = 'Each image must be smaller than 2MB';
        return;
      }

      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === validFiles.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validFiles]
      }));
      delete newErrors.images;
    }

    setErrors(newErrors);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Variant management
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        sku: '',
        price: '',
        comparePrice: '',
        quantity: '',
        attributes: {},
        images: []
      }]
    }));
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  // Option management
  // eslint-disable-next-line no-unused-vars
  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { name: '', values: [] }]
    }));
  };

  // eslint-disable-next-line no-unused-vars
  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  // eslint-disable-next-line no-unused-vars
  const updateOption = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  // eslint-disable-next-line no-unused-vars
  const addOptionValue = (optionIndex) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === optionIndex ? { ...option, values: [...option.values, ''] } : option
      )
    }));
  };

  // eslint-disable-next-line no-unused-vars
  const removeOptionValue = (optionIndex, valueIndex) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === optionIndex ? { 
          ...option, 
          values: option.values.filter((_, j) => j !== valueIndex) 
        } : option
      )
    }));
  };

  // eslint-disable-next-line no-unused-vars
  const updateOptionValue = (optionIndex, valueIndex, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === optionIndex ? {
          ...option,
          values: option.values.map((val, j) => j === valueIndex ? value : val)
        } : option
      )
    }));
  };

  const validateForm = (isDraft = false) => {
    let isValid = true;
    const newErrors = {};

    // Basic validations (skip some for drafts)
    if (!isDraft) {
      if (!formData.name.trim()) {
        newErrors.name = 'Product name is required';
        isValid = false;
      } else if (formData.name.length < 3 || formData.name.length > 100) {
        newErrors.name = 'Product name must be between 3-100 characters';
        isValid = false;
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Product description is required';
        isValid = false;
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        newErrors.price = 'Price must be greater than 0';
        isValid = false;
      }

      if (!formData.category) {
        newErrors.category = 'Category is required';
        isValid = false;
      }
    }

    // Inventory validations
    if (formData.inventory.quantity !== '' && parseInt(formData.inventory.quantity) < 0) {
      newErrors.inventory = { 
        ...newErrors.inventory, 
        quantity: 'Stock quantity cannot be negative' 
      };
      isValid = false;
    }

    // Image validations
    if (!isDraft && formData.images.length === 0) {
      newErrors.images = 'At least one product image is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    
    if (!validateForm(isDraft)) return;

    const loadingState = isDraft ? setIsSavingDraft : setIsLoading;
    loadingState(true);
    setErrors({});
    setSuccess(''); // Clear previous success

    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Append basic fields
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        shortDescription: formData.shortDescription.trim(),
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        category: formData.category,
        subcategory: formData.subcategory || '',
        brand: formData.brand.trim(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        inventory: {
          quantity: parseInt(formData.inventory.quantity) || 0,
          lowStockAlert: parseInt(formData.inventory.lowStockAlert) || 10,
          trackQuantity: formData.inventory.trackQuantity,
          allowBackorder: formData.inventory.allowBackorder,
          sku: formData.inventory.sku.trim(),
          weight: formData.inventory.weight ? parseFloat(formData.inventory.weight) : undefined,
          dimensions: formData.inventory.dimensions
        },
        status: isDraft ? 'draft' : formData.status,
        isFeatured: formData.isFeatured,
        isDigital: formData.isDigital,
        isPublished: formData.isPublished,
        specifications: formData.specifications,
        features: formData.features,
        shipping: formData.shipping,
        warranty: formData.warranty,
        hasVariants: formData.hasVariants,
        variants: formData.variants,
        options: formData.options
      };

      formDataToSend.append('productData', JSON.stringify(productData));
      
      // Append images
      formData.images.forEach(image => {
        formDataToSend.append('images', image);
      });

      // Get auth token
      const token = localStorage.getItem('auth_token');

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, 
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(data.message || 'SKU already exists');
        } else if (response.status === 403) {
          throw new Error(data.message || 'You are not authorized to create products');
        } else {
          throw new Error(data.message || 'Failed to create product');
        }
      }

      // Success
      if (data.success) {
        const successMessage = isDraft 
          ? 'Product saved as draft successfully!' 
          : 'Product created successfully!';
        
        setSuccess(successMessage); 
        
        // Call parent callback if provided
        if (onProductCreated && data.data) {
          onProductCreated(data.data);
        }
        
        // Reset form if not draft
        if (!isDraft) {
          setFormData({
            name: '',
            description: '',
            shortDescription: '',
            price: '',
            comparePrice: '',
            costPrice: '',
            category: '',
            subcategory: '',
            brand: '',
            tags: '',
            inventory: {
              quantity: '',
              lowStockAlert: 10,
              trackQuantity: true,
              allowBackorder: false,
              sku: '',
              weight: '',
              dimensions: { length: '', width: '', height: '', unit: 'cm' }
            },
            status: 'draft',
            isFeatured: false,
            isDigital: false,
            isPublished: true,
            specifications: {},
            features: [],
            shipping: {
              weight: '',
              dimensions: { length: '', width: '', height: '' },
              isFreeShipping: false,
              shippingClass: ''
            },
            warranty: {
              hasWarranty: false,
              period: '',
              description: ''
            },
            hasVariants: false,
            variants: [],
            options: [],
            images: []
          });
          setImagePreviews([]);
        }
      }

    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      loadingState(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const autoSaveDraft = () => {
    // Implement auto-save functionality here
    console.log('Auto-saving draft...');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Product</h1>
          <p className="text-gray-600">Add a new product to your store</p>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
          {/* Basic Information Section */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter product name"
                  error={errors.name}
                  required
                  label="Product Name *"
                  helperText="3-100 characters"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={4}
                  placeholder="Enter detailed product description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Minimum 10 characters</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Brief product summary..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </section>

          {/* Pricing & Inventory Section */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing & Inventory</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                error={errors.price}
                required
                label="Price *"
                min="0"
                step="0.01"
              />

              <Input
                name="comparePrice"
                type="number"
                value={formData.comparePrice}
                onChange={handleChange}
                placeholder="0.00"
                label="Compare Price"
                min="0"
                step="0.01"
                helperText="Original price for showing discounts"
              />

              <Input
                name="costPrice"
                type="number"
                value={formData.costPrice}
                onChange={handleChange}
                placeholder="0.00"
                label="Cost Price"
                min="0"
                step="0.01"
                helperText="Your cost for this product"
              />

              <Input
                name="inventory.quantity"
                type="number"
                value={formData.inventory.quantity}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0"
                label="Stock Quantity"
                min="0"
                error={errors.inventory?.quantity}
              />

              <Input
                name="inventory.lowStockAlert"
                type="number"
                value={formData.inventory.lowStockAlert}
                onChange={handleChange}
                placeholder="10"
                label="Low Stock Alert"
                min="0"
              />

              <Input
                name="inventory.sku"
                value={formData.inventory.sku}
                onChange={handleChange}
                placeholder="Auto-generated SKU"
                label="SKU"
                helperText="Unique product identifier"
              />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  name="inventory.trackQuantity"
                  type="checkbox"
                  checked={formData.inventory.trackQuantity}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Track quantity
                </label>
              </div>

              <div className="flex items-center">
                <input
                  name="inventory.allowBackorder"
                  type="checkbox"
                  checked={formData.inventory.allowBackorder}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Allow backorder
                </label>
              </div>
            </div>
          </section>

          {/* Category & Brand Section */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Category & Brand</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <Input
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                placeholder="Enter subcategory"
                label="Subcategory"
              />

              <div className="md:col-span-2">
                <Input
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Enter brand name"
                  label="Brand"
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="tag1, tag2, tag3"
                  label="Tags"
                  helperText="Comma-separated keywords"
                />
              </div>
            </div>
          </section>

          {/* Images Section */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Images</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer block"
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload product images
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  PNG, JPG, WebP up to 2MB each (max 5 images)
                </span>
              </label>
            </div>

            {errors.images && (
              <p className="mt-2 text-sm text-red-600">{errors.images}</p>
            )}

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Product Options Section */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Options & Variants</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  name="hasVariants"
                  type="checkbox"
                  checked={formData.hasVariants}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700 font-medium">
                  This product has variants (sizes, colors, etc.)
                </label>
              </div>

              {formData.hasVariants && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Variants</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVariant}
                    >
                      Add Variant
                    </Button>
                  </div>

                  {formData.variants.map((variant, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Variant {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeVariant(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Input
                          placeholder="Variant SKU"
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                          label="SKU"
                        />
                        <Input
                          type="number"
                          placeholder="Price"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', e.target.value)}
                          label="Price"
                          min="0"
                          step="0.01"
                        />
                        <Input
                          type="number"
                          placeholder="Compare Price"
                          value={variant.comparePrice}
                          onChange={(e) => updateVariant(index, 'comparePrice', e.target.value)}
                          label="Compare Price"
                          min="0"
                          step="0.01"
                        />
                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={variant.quantity}
                          onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
                          label="Quantity"
                          min="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Status & Settings Section */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Status & Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    name="isFeatured"
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Feature this product
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    name="isDigital"
                    type="checkbox"
                    checked={formData.isDigital}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Digital product (no shipping required)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    name="isPublished"
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Publish immediately
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Submit Section */}
          <section>
            {/* Success Message */}
            {success && (
              <Alert variant="success" message={success} className="mb-4" />
            )}

            {/* Submit Error */}
            {errors.submit && (
              <Alert variant="error" message={errors.submit} className="mb-4" />
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                isLoading={isSavingDraft}
                onClick={(e) => handleSubmit(e, true)}
              >
                Save as Draft
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={isLoading || Object.keys(errors).length > 0}
              >
                Create Product
              </Button>
            </div>
          </section>
        </form>
      </Card>
    </div>
  );
};

export default ProductCreationForm;