// src/components/common/ProfilePicture.jsx - Fixed to use backend displayPicture
import React, { useState, useEffect } from "react";
import { User } from "lucide-react";

export const ProfilePicture = ({
  user,
  size = "md", // xs, sm, md, lg, xl, 2xl
  showFallback = true,
  className = "",
  onClick,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Size configurations
  const sizeConfig = {
    xs: {
      container: "h-6 w-6",
      text: "text-xs",
      icon: "h-3 w-3",
    },
    sm: {
      container: "h-8 w-8",
      text: "text-sm",
      icon: "h-4 w-4",
    },
    md: {
      container: "h-10 w-10",
      text: "text-base",
      icon: "h-5 w-5",
    },
    lg: {
      container: "h-16 w-16",
      text: "text-xl",
      icon: "h-8 w-8",
    },
    xl: {
      container: "h-20 w-20",
      text: "text-2xl",
      icon: "h-10 w-10",
    },
    "2xl": {
      container: "h-24 w-24",
      text: "text-3xl",
      icon: "h-12 w-12",
    },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  // Reset error state when user changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(false);
  }, [user?.id, user?._id, user?.displayPicture]);

  // Get display picture data from backend's virtual field
  const displayPicture = user?.displayPicture;

  // Get image URL based on size preference
  const getImageUrl = () => {
    if (!displayPicture || displayPicture.type !== "image") {
      return null;
    }

    // For smaller sizes, prefer avatar if available
    if ((size === "xs" || size === "sm") && displayPicture.avatar) {
      return displayPicture.avatar;
    }

    // Use main image for larger sizes or if avatar not available
    return displayPicture.main;
  };

  // Get initials from backend or fallback to name calculation
  const getInitials = () => {
    if (displayPicture?.type === "initials" && displayPicture.initials) {
      return displayPicture.initials;
    }

    // Fallback: calculate from name if backend doesn't provide initials
    const name = user?.name;
    if (!name) return "U";

    const names = name.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Get background color based on user name (consistent color per user)
  const getBackgroundColor = (name) => {
    if (!name) return "bg-gray-500";

    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-cyan-500",
    ];

    // Use character codes to get consistent color for same name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const imageUrl = getImageUrl();
  const initials = getInitials();
  const backgroundColor = getBackgroundColor(user?.name);

  // Handle image load start
  const handleImageLoadStart = () => {
    setImageLoading(true);
  };

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  // Handle image load error
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const containerClasses = `
    ${config.container}
    rounded-full
    flex
    items-center
    justify-center
    overflow-hidden
    flex-shrink-0
    relative
    ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
    ${className}
  `;

  // Show profile image if available and not errored
  if (imageUrl && !imageError) {
    return (
      <div className={containerClasses} onClick={onClick} {...props}>
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
          </div>
        )}
        <img
          src={imageUrl}
          alt={`${user?.name || "User"}'s profile`}
          className={`w-full h-full object-cover transition-opacity ${
            imageLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoadStart={handleImageLoadStart}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      </div>
    );
  }

  // Show initials fallback
  if (showFallback && user?.name) {
    return (
      <div
        className={`${containerClasses} ${backgroundColor} text-white font-medium`}
        onClick={onClick}
        {...props}
      >
        <span className={config.text}>{initials}</span>
      </div>
    );
  }

  // Show default user icon fallback
  return (
    <div
      className={`${containerClasses} bg-gray-400 text-white`}
      onClick={onClick}
      {...props}
    >
      <User className={config.icon} />
    </div>
  );
};

// Preset component variants for common use cases
export const ProfileAvatar = ({ user, onClick, className = "" }) => (
  <ProfilePicture
    user={user}
    size="sm"
    onClick={onClick}
    className={className}
  />
);

export const ProfileAvatarLarge = ({ user, onClick, className = "" }) => (
  <ProfilePicture
    user={user}
    size="lg"
    onClick={onClick}
    className={className}
  />
);

export const ProfileAvatarXL = ({ user, onClick, className = "" }) => (
  <ProfilePicture
    user={user}
    size="xl"
    onClick={onClick}
    className={className}
  />
);
