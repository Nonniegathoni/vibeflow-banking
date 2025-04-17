declare module 'react-resizable-panels' {
    import * as React from 'react'
  
    export interface PanelGroupProps {
      direction: 'horizontal' | 'vertical'
      children: React.ReactNode
      className?: string
      onLayout?: (sizes: number[]) => void
      autoSaveId?: string
      id?: string
      style?: React.CSSProperties
      tagName?: string
    }
  
    export interface PanelProps {
      defaultSize?: number
      minSize?: number
      maxSize?: number
      className?: string
      children: React.ReactNode
      id?: string
      collapsible?: boolean
      collapsedSize?: number
      onCollapse?: () => void
      onExpand?: () => void
      onResize?: (size: number) => void
      style?: React.CSSProperties
      tagName?: string
    }
  
    export interface PanelResizeHandleProps {
      className?: string
      children?: React.ReactNode
      disabled?: boolean
      id?: string
      onDragging?: (isDragging: boolean) => void
      style?: React.CSSProperties
      tagName?: string
    }
  
    export const PanelGroup: React.ComponentType<PanelGroupProps>
    export const Panel: React.ComponentType<PanelProps>
    export const PanelResizeHandle: React.ComponentType<PanelResizeHandleProps>
  }