import { X } from 'lucide-react'
import React from 'react'
import type { BookStatus } from '../../types'
import { ReadingStatusLabels, type ReadingStatusValue } from '../../types'
import { formatRelativeDate } from '../../utils/dateUtils'
import { UserAvatar } from '../common/UserAvatar'
import StatusDropdown from './StatusDropdown'

interface StatusListProps {
    statuses: BookStatus[]
    currentUserId: number | null
    onStatusChange?: (statusId: ReadingStatusValue) => void
    onStatusDelete?: () => void
}

const StatusList: React.FC<StatusListProps> = ({
    statuses,
    currentUserId,
    onStatusChange,
    onStatusDelete
}) => {
    // Sort statuses by user_id ascending
    const sortedStatuses = [...statuses].sort((a, b) => a.user_id - b.user_id)

    if (sortedStatuses.length === 0) {
        return (
            <p className="text-amber-500 text-sm">No reading statuses yet.</p>
        )
    }

    return (
        <div className="space-y-3">
            {sortedStatuses.map((status) => {
                const isCurrentUser = currentUserId === status.user_id

                return (
                    <div
                        key={status.id}
                        className={`flex items-start md:items-center justify-between p-3 rounded-lg gap-3 ${isCurrentUser ? 'bg-amber-950/50 border-2 border-amber-700' : 'bg-zinc-800/50'
                            }`}
                    >
                        <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
                            {/* User Avatar */}
                            <UserAvatar
                                user={{
                                    id: status.user.id,
                                    name: status.user.name,
                                    color: status.user.color,
                                    avatar_image: status.user.avatar_image,
                                }}
                                size="sm"
                            />

                            {/* Status and User Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center gap-2">
                                    <span className="font-medium text-amber-100 truncate">{status.user.name}</span>
                                    {isCurrentUser && onStatusChange ? (
                                        <StatusDropdown
                                            value={status.status_id as ReadingStatusValue}
                                            onChange={onStatusChange}
                                        />
                                    ) : (
                                        <span className="px-3 py-1 bg-zinc-700/50 border border-amber-900/30 rounded-md text-sm text-amber-200 inline-block">
                                            {ReadingStatusLabels[status.status_id as ReadingStatusValue]}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-amber-600 mt-1">
                                    {formatRelativeDate(status.created_at)}
                                </p>
                            </div>
                        </div>

                        {/* Delete button for current user */}
                        {isCurrentUser && onStatusDelete && (
                            <button
                                onClick={onStatusDelete}
                                className="p-1 text-amber-600 hover:text-red-500 transition-colors flex-shrink-0"
                                aria-label="Remove status"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default StatusList
