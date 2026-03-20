"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, X, GripVertical, UserCircle } from "lucide-react"
import { DragDropProvider } from "@dnd-kit/react"
import { useSortable, isSortable } from "@dnd-kit/react/sortable"

interface AvatarFile {
  file: File
  preview: string
  id: string
}

interface SortableAvatarProps {
  avatar: AvatarFile
  index: number
  onRemove: (id: string) => void
  showHandle?: boolean
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
}

function SortableAvatar({
  avatar,
  index,
  onRemove,
  showHandle,
  size = "md",
}: SortableAvatarProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: avatar.id,
    index,
  })

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={ref}
            className={cn(
              "group relative -ml-2 first:ml-0",
              isDragging && "z-10"
            )}
          >
            <Avatar
              className={cn(
                sizeClasses[size],
                "border-2 border-background transition-transform",
                isDragging && "scale-110 ring-2 ring-primary"
              )}
            >
              <AvatarImage src={avatar.preview} alt="" />
              <AvatarFallback>
                <UserCircle className="size-full text-muted-foreground" />
              </AvatarFallback>
            </Avatar>

            <div className="absolute -right-1 -top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              {showHandle && (
                <button
                  ref={handleRef}
                  className="flex size-4 cursor-grab items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm active:cursor-grabbing"
                  aria-label="Drag to reorder"
                >
                  <GripVertical className="size-2.5" />
                </button>
              )}
              <button
                onClick={() => onRemove(avatar.id)}
                className="flex size-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm"
                aria-label="Remove"
              >
                <X className="size-2.5" />
              </button>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{avatar.file.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface AvatarDropzoneSortableStackProps {
  onFilesSelect?: (files: File[]) => void
  onReorder?: (files: File[]) => void
  maxAvatars?: number
  maxSize?: number
  className?: string
  enableReorder?: boolean
  size?: "sm" | "md" | "lg"
}

export function AvatarDropzoneSortableStack({
  onFilesSelect,
  onReorder,
  maxAvatars = 5,
  maxSize = 5 * 1024 * 1024,
  className,
  enableReorder = true,
  size = "md",
}: AvatarDropzoneSortableStackProps) {
  const [avatars, setAvatars] = React.useState<AvatarFile[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFiles = React.useCallback(
    (newFiles: FileList) => {
      const validFiles = Array.from(newFiles)
        .filter((file) => file.type.startsWith("image/") && file.size <= maxSize)
        .slice(0, maxAvatars - avatars.length)

      const newAvatarObjects = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).slice(2),
      }))

      const updated = [...avatars, ...newAvatarObjects].slice(0, maxAvatars)
      setAvatars(updated)
      onFilesSelect?.(updated.map((a) => a.file))
    },
    [avatars, maxAvatars, maxSize, onFilesSelect]
  )

  const removeAvatar = (id: string) => {
    const updated = avatars.filter((a) => a.id !== id)
    setAvatars(updated)
    onFilesSelect?.(updated.map((a) => a.file))
  }

  const handleDragEnd = React.useCallback(
    (event: { canceled: boolean; operation: { source: unknown } }) => {
      if (event.canceled) return

      const { source } = event.operation

      if (isSortable(source)) {
        const { initialIndex, index } = source

        if (initialIndex !== index) {
          setAvatars((prev) => {
            const newAvatars = [...prev]
            const [removed] = newAvatars.splice(initialIndex, 1)
            newAvatars.splice(index, 0, removed)
            onReorder?.(newAvatars.map((a) => a.file))
            return newAvatars
          })
        }
      }
    },
    [onReorder]
  )

  const avatarsContent = (
    <div className="flex items-center">
      {avatars.map((avatar, index) => (
        <SortableAvatar
          key={avatar.id}
          avatar={avatar}
          index={index}
          onRemove={removeAvatar}
          showHandle={enableReorder}
          size={size}
        />
      ))}

      {avatars.length < maxAvatars && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => inputRef.current?.click()}
                className={cn(
                  sizeClasses[size],
                  "ml-2 rounded-full border-dashed"
                )}
              >
                <Plus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add avatar ({avatars.length}/{maxAvatars})</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="sr-only"
      />

      {enableReorder ? (
        <DragDropProvider onDragEnd={handleDragEnd}>
          {avatarsContent}
        </DragDropProvider>
      ) : (
        avatarsContent
      )}

      {avatars.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {enableReorder ? "Drag to reorder avatars" : `${avatars.length} avatar${avatars.length > 1 ? "s" : ""}`}
        </p>
      )}
    </div>
  )
}
