/**
 * Tabs component following Linear/Modern design system
 *
 * @module components/ui/Tabs
 */

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type KeyboardEvent,
  useRef,
  useEffect,
} from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

interface TabsProps {
  /** Currently active tab value */
  value?: string;
  /** Default active tab (uncontrolled) */
  defaultValue?: string;
  /** Callback when tab changes */
  onValueChange?: (value: string) => void;
  /** Children (TabsList and TabsContent) */
  children: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Tabs container component
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="headers">
 *   <TabsList>
 *     <TabsTrigger value="headers">Headers</TabsTrigger>
 *     <TabsTrigger value="body">Body</TabsTrigger>
 *     <TabsTrigger value="auth">Auth</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="headers">
 *     <HeadersEditor />
 *   </TabsContent>
 *   <TabsContent value="body">
 *     <BodyEditor />
 *   </TabsContent>
 *   <TabsContent value="auth">
 *     <AuthEditor />
 *   </TabsContent>
 * </Tabs>
 * ```
 */
export function Tabs({
  value,
  defaultValue = '',
  onValueChange,
  children,
  className = '',
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeTab = value ?? internalValue;

  const setActiveTab = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  /** Tab triggers */
  children: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Container for tab triggers with animated underline
 */
export function TabsList({ children, className = '' }: TabsListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const { activeTab } = useTabsContext();

  // Update underline position when active tab changes
  useEffect(() => {
    if (!listRef.current) return;

    const activeButton = listRef.current.querySelector(
      `[data-state="active"]`
    ) as HTMLButtonElement | null;

    if (activeButton) {
      const listRect = listRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setUnderlineStyle({
        left: buttonRect.left - listRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeTab]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const buttons = listRef.current?.querySelectorAll('[role="tab"]');
    if (!buttons) return;

    const buttonArray = Array.from(buttons) as HTMLButtonElement[];
    const currentIndex = buttonArray.findIndex((btn) => btn === document.activeElement);

    let nextIndex = -1;

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % buttonArray.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + buttonArray.length) % buttonArray.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = buttonArray.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    buttonArray[nextIndex]?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={`
        relative flex items-center gap-1
        border-b border-border
        ${className}
      `}
    >
      {children}

      {/* Animated underline */}
      <div
        className="absolute bottom-0 h-0.5 bg-accent transition-all duration-200 ease-expo-out"
        style={{
          left: underlineStyle.left,
          width: underlineStyle.width,
        }}
      />
    </div>
  );
}

interface TabsTriggerProps {
  /** Value identifying this tab */
  value: string;
  /** Tab label */
  children: ReactNode;
  /** Disable this tab */
  disabled?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Individual tab trigger button
 */
export function TabsTrigger({ value, children, disabled = false, className = '' }: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      data-state={isActive ? 'active' : 'inactive'}
      disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveTab(value)}
      className={`
        relative px-4 py-2.5
        text-sm font-medium
        transition-colors duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${
          isActive
            ? 'text-foreground'
            : 'text-foreground-muted hover:text-foreground'
        }
        ${className}
      `}
    >
      {/* Gradient text effect when active */}
      <span
        className={
          isActive
            ? 'bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent'
            : ''
        }
      >
        {children}
      </span>
    </button>
  );
}

interface TabsContentProps {
  /** Value identifying this content */
  value: string;
  /** Tab panel content */
  children: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Content panel for a tab
 */
export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      className={`
        animate-fade-up
        focus:outline-none
        ${className}
      `}
    >
      {children}
    </div>
  );
}
