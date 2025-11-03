import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

const ProfileUpdateForm = ({ userData, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    preferredCurrency: "USD",
    newsletter: false,
    profilePicture: null,
    currentPassword: "",
  });

  //Profile picture preview initialization
  const [imagePreview, setImagePreview] = useState("");

  //Pre-populate form with current user data (with guards)
  useEffect(() => {
    if (userData) {
      setFormData((prev) => ({
        ...prev,
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.addresses?.[0]?.street || "",
        country: userData.addresses?.[0]?.country || "",
        preferredCurrency: userData.preferences?.currency || "USD",
        newsletter: userData.preferences?.newsletter || false,
      }));
      setImagePreview(userData.avatar || ""); //Update image preview
    }
  }, [userData]);

  // Country options
  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "Sri Lanka",
    "India",
    "China",
    "Brazil",
    "Mexico",
  ];

  // Currency options
  const currencies = [
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "GBP", label: "British Pound (GBP)" },
    { value: "LKR", label: "Sri Lankan Rupee (LKR)" },
    { value: "INR", label: "Indian Rupee (INR)" },
    { value: "JPY", label: "Japanese Yen (JPY)" },
  ];

  // Validation functions
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Name is required";
        } else if (value.length < 2 || value.length > 50) {
          newErrors.name = "Name must be between 2-50 characters";
        } else if (/[^a-zA-Z\s]/.test(value)) {
          newErrors.name = "Name cannot contain special characters";
        } else {
          delete newErrors.name;
        }
        break;

      case "email":
        if (!value) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;

      case "phone":
        if (value && !/^\+?[\d\s\-()]{10,}$/.test(value)) {
          newErrors.phone = "Please enter a valid phone number";
        } else {
          delete newErrors.phone;
        }
        break;

      case "currentPassword":
        if ((isEmailChanged || formData.profilePicture) && !value) {
          newErrors.currentPassword =
            "Current password is required for security changes";
        } else {
          delete newErrors.currentPassword;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    const fieldValue =
      type === "checkbox" ? checked : type === "file" ? files[0] : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    //Check if email is being changed (with guard)
    if (name === "email" && userData && value !== userData.email) {
      setIsEmailChanged(true);
    }

    // Validate file upload
    if (type === "file" && files[0]) {
      validateFile(files[0]);
    }

    // Validate field on change
    if (type !== "checkbox" && type !== "file") {
      validateField(name, fieldValue);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateFile = (file) => {
    const newErrors = { ...errors };

    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      newErrors.profilePicture = "Please upload a JPG or PNG image";
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      newErrors.profilePicture = "Image must be smaller than 5MB";
    }

    if (!newErrors.profilePicture) {
      delete newErrors.profilePicture;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const requiredFields = ["name", "email"];
    let isValid = true;
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
        isValid = false;
      }
    });

    // Email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Phone format
    if (formData.phone && !/^\+?[\d\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    // Current password for sensitive changes
    if (
      (isEmailChanged || formData.profilePicture) &&
      !formData.currentPassword
    ) {
      newErrors.currentPassword =
        "Current password is required for security changes";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccess("");

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Append text fields
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("email", formData.email.toLowerCase().trim());
      formDataToSend.append("phone", formData.phone.trim() || "");
      formDataToSend.append("address", formData.address.trim() || "");
      formDataToSend.append("country", formData.country || "");
      formDataToSend.append("preferredCurrency", formData.preferredCurrency);
      formDataToSend.append("newsletter", formData.newsletter.toString());

      // Append current password if required
      if (isEmailChanged || formData.profilePicture) {
        formDataToSend.append("currentPassword", formData.currentPassword);
      }

      // Append profile picture if selected
      if (formData.profilePicture) {
        formDataToSend.append("profilePicture", formData.profilePicture);
      }

      // Get auth token
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          throw new Error(data.message || "Email already exists");
        } else if (response.status === 401) {
          throw new Error(data.message || "Current password is incorrect");
        } else {
          throw new Error(data.message || "Failed to update profile");
        }
      }

      // Success
      if (data.success) {
        setSuccess("Profile updated successfully!");

        // Clear current password field
        setFormData((prev) => ({ ...prev, currentPassword: "" }));
        setIsEmailChanged(false);

        // Call parent callback if provided
        if (onUpdate && data.data) {
          onUpdate(data.data);
        }

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (error) {
      setErrors({ submit: error.message });

      // Clear current password field on error
      setFormData((prev) => ({ ...prev, currentPassword: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  //Profile picture preview effect
  useEffect(() => {
    if (formData.profilePicture) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(formData.profilePicture);
    } else {
      // Reset to original avatar if no new file
      setImagePreview(userData?.avatar || "");
    }
  }, [formData.profilePicture, userData]);

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Update Profile
        </h1>
        <p className="text-gray-600">
          Manage your account information and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Section */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Profile Picture
          </h3>
          <div className="flex items-center space-x-6">
            <div className="shrink-0">
              <div className="relative">
                <img
                  className="h-20 w-20 rounded-full object-cover border-2 border-gray-300"
                  src={imagePreview || "/default-avatar.png"}
                  alt="Profile preview"
                />
                {formData.profilePicture && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs text-center px-2">
                      New
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <input
                type="file"
                name="profilePicture"
                onChange={handleChange}
                accept=".jpg,.jpeg,.png"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                JPG or PNG, max 5MB. Current password required to change.
              </p>
              {errors.profilePicture && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.profilePicture}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Your full name"
                error={errors.name}
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="your@email.com"
                error={errors.email}
                required
              />
              {isEmailChanged && (
                <p className="mt-1 text-sm text-yellow-600">
                  Email change will require verification
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="+94 77 217 4920"
                error={errors.phone}
              />
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Country
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              placeholder="Enter your shipping/billing address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Preferences Section */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="preferredCurrency"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Preferred Currency
              </label>
              <select
                id="preferredCurrency"
                name="preferredCurrency"
                value={formData.preferredCurrency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {currencies.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="newsletter"
                name="newsletter"
                type="checkbox"
                checked={formData.newsletter}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="newsletter"
                className="ml-2 text-sm text-gray-700"
              >
                Subscribe to newsletter
              </label>
            </div>
          </div>
        </div>

        {/* Security Verification Section */}
        {(isEmailChanged || formData.profilePicture) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              Security Verification Required
            </h4>
            <p className="text-sm text-yellow-700 mb-3">
              For security reasons, please enter your current password to
              confirm these changes.
            </p>
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Current Password *
              </label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter current password"
                error={errors.currentPassword}
                required
              />
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              //Reset form to original data (with guards)
              setFormData({
                name: userData?.name || "",
                email: userData?.email || "",
                phone: userData?.phone || "",
                address: userData?.addresses?.[0]?.street || "",
                country: userData?.addresses?.[0]?.country || "",
                preferredCurrency: userData?.preferences?.currency || "USD",
                newsletter: userData?.preferences?.newsletter || false,
                profilePicture: null,
                currentPassword: "",
              });
              setIsEmailChanged(false);
              setErrors({});
              setSuccess("");
              setImagePreview(userData?.avatar || "");
            }}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading || Object.keys(errors).length > 0}
          >
            Update Profile
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProfileUpdateForm;
