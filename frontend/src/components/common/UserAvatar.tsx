import type { UserProfile } from "../../types"

interface UserAvatarProps {
  user: UserProfile
  size?: 'sm' | 'md' | 'lg'
}
export function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  }

  // If user has an avatar image, display it
  if (user.avatar_image) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden border-2 border-amber-700/30`}
        title={user.name}
      >
        <img
          src={user.avatar_image}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  // Fallback to colored circle with initial
  return (
    <div
      className={`${user.color} ${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-bold`}
      title={user.name}
      style={{ backgroundColor: `${user.color}` }}
    >
      {user.name.charAt(0)}
    </div>
  )
}
