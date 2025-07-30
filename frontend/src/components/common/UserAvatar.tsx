import type { User } from "../contexts/UserContext"

interface UserAvatarProps {
  user: User
  size?: 'sm' | 'md' | 'lg'
}
export function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  }
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
