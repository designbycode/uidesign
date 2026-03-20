"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, X, GripVertical, User, Upload, Trash2 } from "lucide-react"
import { DragDropProvider } from "@dnd-kit/react"
import { useSortable, isSortable } from "@dnd-kit/react/sortable"

interface AvatarFile {
  file: File
  preview: string
  id: string
}

interface SortableAvatarRowItemProps {
  avatar: AvatarFile
  index: number
  onRemove: (id: string) => void
  showHandle?: boolean
}

function SortableAvatarRowItem({
  avatar,
  index,
  onRemove,
  showHandle,
}: SortableAvatarRowItemProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: avatar.id,
    index,
  })

  return (
    <div
      ref={ref}
      className={cn(
        "group flex items-center gap-3 rounded-md border bg-card p-2 transition-all",
        isDragging && "z-10 shadow-md ring-2 ring-primary"
      )}
    >
      {showHandle && (
        <button
          ref={handleRef}
          className="flex size-6 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </button>
      )}

      <Avatar className="size-10 border">
        <AvatarImage src={avatar.preview} alt="" />
        <AvatarFallback>
          <User className="size-5 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{avatar.file.name}</span>
        <span className="text-xs text-muted-foreground">
          {(avatar.file.size / 1024).toFixed(1)} KB
        </span>
      </div>

      <Badge variant="secondary" className="shrink-0">
        #{index + 1}
      </Badge>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(avatar.id)}
        className="size-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}

interface AvatarDropzoneSortableRowProps {
  onFilesSelect?: (files: File[]) => void
  onReorder?: (files: File[]) => void
  maxAvatars?: number
  maxSize?: number
  className?: string
  enableReorder?: boolean
  title?: string
  description?: string
}

export function AvatarDropzoneSortableRow({
  onFilesSelect,
  onReorder,
  maxAvatars = 4,
  maxSize = 5 * 1024 * 1024,
  className,
  enableReorder = true,
  title = "Team Members",
  description = "Add and reorder team member avatars",
}: AvatarDropzoneSortableRowProps) {
  const [avatars, setAvatars] = React.useState<AvatarFile[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
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

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const removeAvatar = (id: string) => {
    const updated = avatars.filter((a) => a.id !== id)
    setAvatars(updated)
    onFilesSelect?.(updated.map((a) => a.file))
  }

  const clearAll = () => {
    setAvatars([])
    onFilesSelect?.([])
    if (inputRef.current) inputRef.current.value = ""
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
    <div className="space-y-2">
      {avatars.map((avatar, index) => (
        <SortableAvatarRowItem
          key={avatar.id}
          avatar={avatar}
          index={index}
          onRemove={removeAvatar}
          showHandle={enableReorder}
        />
      ))}
    </div>
  )

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
          {avatars.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="gap-1 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="sr-only"
        />

        {avatars.length === 0 ? (
          <div
            className={cn(
              "flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed p-6 transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-muted-foreground/50"
            )}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                inputRef.current?.click()
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Upload avatars"
          >
            <Upload className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drop images or click to add team members
            </p>
          </div>
        ) : (
          <>
            {enableReorder ? (
              <DragDropProvider onDragEnd={handleDragEnd}>
                {avatarsContent}
              </DragDropProvider>
            ) : (
              avatarsContent
            )}

            {avatars.length < maxAvatars && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                className="w-full gap-1"
              >
                <Plus className="size-4" />
                Add Member ({avatars.length}/{maxAvatars})
              </Button>
            )}

            {enableReorder && (
              <p className="text-center text-xs text-muted-foreground">
                Drag items to change order
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
