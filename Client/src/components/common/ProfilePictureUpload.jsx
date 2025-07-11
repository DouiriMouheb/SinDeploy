// src/components/common/ProfilePictureUpload.jsx
import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Camera, Loader2, AlertCircle, Image } from "lucide-react";
import { Button } from "./Button";
import { ProfilePicture } from "./ProfilePicture";

export const ProfilePictureUpload = ({
  user,
  onUpload,
  onRemove,
  loading = false,
  className = "",
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // File validation
  const validateFile = (file) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
      );
    }

    if (file.size > maxSize) {
      throw new Error("File too large. Maximum size is 5MB.");
    }

    return true;
  };

  // Create preview URL
  const createPreview = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  // Handle file selection
  const handleFileSelect = useCallback(
    async (files) => {
      try {
        const file = files[0];
        if (!file) return;

        // Validate file
        validateFile(file);

        // Create preview
        const previewUrl = await createPreview(file);
        setPreview(previewUrl);

        // Call upload handler
        if (onUpload) {
          setUploadProgress(0);
          await onUpload(file);
        }

        // Clear preview after successful upload
        setPreview(null);
      } catch (error) {
        console.error("File selection error:", error);
        setPreview(null);
        // Error handling is done by parent component
        throw error;
      }
    },
    [onUpload]
  );

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect]
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files);
      }
    },
    [handleFileSelect]
  );

  // Open file dialog
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Handle remove
  const handleRemove = async () => {
    if (onRemove) {
      await onRemove();
    }
    setPreview(null);
  };

  // Clear preview
  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasExistingImage = user?.displayPicture?.type === "image";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Profile Picture */}
      <div className="flex items-center space-x-4">
        <ProfilePicture
          user={user}
          size="xl"
          className="border-2 border-gray-200"
        />

        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">Profile Picture</h3>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG or WebP. Max size 5MB. Recommended 200x200px.
          </p>

          {hasExistingImage && (
            <div className="flex space-x-2 mt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={openFileDialog}
                disabled={loading}
              >
                <Camera className="h-4 w-4 mr-1" />
                Change
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={handleRemove}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Area - only show if no existing image or if we're showing preview */}
      {(!hasExistingImage || preview) && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200
            ${
              dragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }
            ${loading ? "opacity-50 pointer-events-none" : "cursor-pointer"}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={!loading ? openFileDialog : undefined}
        >
          {/* Preview Image */}
          {preview && (
            <div className="relative inline-block mb-4">
              <img
                src={preview}
                alt="Preview"
                className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
              />

              {!loading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearPreview();
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>
          )}

          {/* Upload Icon and Text */}
          {!preview && (
            <div className="space-y-2">
              {loading ? (
                <Loader2 className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
              ) : (
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
              )}

              <div>
                <p className="text-sm text-gray-600">
                  {loading ? (
                    "Uploading..."
                  ) : dragActive ? (
                    "Drop your image here"
                  ) : (
                    <>
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </>
                  )}
                </p>

                {!loading && (
                  <p className="text-xs text-gray-400">
                    PNG, JPG, WebP up to 5MB
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-gray-200 rounded-full h-1">
                <div
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInputChange}
            disabled={loading}
          />
        </div>
      )}

      {/* Upload Instructions */}
      {!hasExistingImage && !preview && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-start">
            <Image className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">Tips for best results:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use a square image (200x200px recommended)</li>
                <li>Ensure good lighting and clear focus</li>
                <li>Center your face in the image</li>
                <li>Avoid busy backgrounds</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
