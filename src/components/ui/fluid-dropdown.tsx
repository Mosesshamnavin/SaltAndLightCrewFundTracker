"use client"

import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import { ChevronDown, Shirt, Briefcase, Smartphone, Home, Layers } from "lucide-react"

// Utility function for className merging
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

// Custom hook for click outside detection
function useClickAway(ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent | TouchEvent) => void) {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler(event)
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler])
}

// Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline"
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variant === "outline" && "border border-neutral-700 bg-transparent",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

// Types
export interface FluidCategory {
  id: string
  label: string
  icon: React.ElementType
  color: string
}

export const defaultCategories: FluidCategory[] = [
  { id: "all", label: "All", icon: Layers, color: "#A06CD5" },
  { id: "lifestyle", label: "Lifestyle", icon: Shirt, color: "#FF6B6B" },
  { id: "desk", label: "Desk", icon: Briefcase, color: "#4ECDC4" },
  { id: "tech", label: "Tech", icon: Smartphone, color: "#45B7D1" },
  { id: "home", label: "Home", icon: Home, color: "#F9C74F" },
]

// Icon wrapper with animation
const IconWrapper = ({
  icon: Icon,
  isHovered,
  color,
}: { icon: React.ElementType; isHovered: boolean; color: string }) => (
  <motion.div 
    className="w-4 h-4 mr-2 relative" 
    initial={false} 
    animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
  >
    <Icon className="w-4 h-4" />
    {isHovered && (
      <motion.div
        className="absolute inset-0"
        style={{ color }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <Icon className="w-4 h-4" strokeWidth={2} />
      </motion.div>
    )}
  </motion.div>
)

// Animation variants
const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: any = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

interface FluidDropdownProps {
  categories?: FluidCategory[]
  selectedId?: string
  onSelect?: (category: FluidCategory) => void
  className?: string
}

// Main component
export function FluidDropdown({
  categories = defaultCategories,
  selectedId,
  onSelect,
  className,
}: FluidDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const initialCategory = categories.find((c) => c.id === selectedId) || categories[0]
  const [selectedCategory, setSelectedCategory] = React.useState<FluidCategory>(initialCategory)
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (selectedId) {
      const match = categories.find((c) => c.id === selectedId)
      if (match) setSelectedCategory(match)
    }
  }, [selectedId, categories])

  useClickAway(dropdownRef, () => setIsOpen(false))

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  const handleChoose = (category: FluidCategory) => {
    setSelectedCategory(category)
    setIsOpen(false)
    if (onSelect) onSelect(category)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn("w-full relative", className)}
        ref={dropdownRef}
      >
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full justify-between bg-white text-slate-800",
            "hover:bg-slate-50 hover:text-slate-900",
            "focus:ring-2 focus:ring-[#0F766E]/20 focus:ring-offset-1",
            "transition-all duration-200 ease-in-out",
            "border border-slate-200 focus:border-[#0F766E]",
            "h-11 px-3.5 rounded-2xl text-xs sm:text-sm font-semibold shadow-sm",
            isOpen && "border-[#0F766E] ring-2 ring-[#0F766E]/20",
          )}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="flex items-center">
            <IconWrapper 
              icon={selectedCategory.icon} 
              isHovered={false} 
              color={selectedCategory.color} 
            />
            {selectedCategory.label}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center w-5 h-5 text-slate-400"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{
                opacity: 1,
                y: 0,
                height: "auto",
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 1,
                },
              }}
              exit={{
                opacity: 0,
                y: -6,
                height: 0,
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 1,
                },
              }}
              className="absolute left-0 right-0 top-full mt-2 z-50"
              onKeyDown={handleKeyDown}
            >
              <motion.div
                className="w-full rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl overflow-hidden"
                initial={{ borderRadius: 12 }}
                animate={{
                  borderRadius: 16,
                  transition: { duration: 0.2 },
                }}
                style={{ transformOrigin: "top" }}
              >
                <motion.div 
                  className="py-1 relative" 
                  variants={containerVariants} 
                  initial="hidden" 
                  animate="visible"
                >
                  <motion.div
                    layoutId="fluid-hover-highlight"
                    className="absolute inset-x-1 bg-slate-100/90 rounded-xl pointer-events-none"
                    animate={{
                      y: categories.findIndex((c) => (hoveredCategory || selectedCategory.id) === c.id) * 42 +
                        (categories.findIndex((c) => (hoveredCategory || selectedCategory.id) === c.id) > 0 ? 8 : 0),
                      height: 38,
                    }}
                    transition={{
                      type: "spring",
                      bounce: 0.15,
                      duration: 0.4,
                    }}
                  />
                  {categories.map((category, index) => (
                    <React.Fragment key={category.id}>
                      {index === 1 && (
                        <motion.div 
                          className="mx-3 my-1.5 border-t border-slate-100" 
                          variants={itemVariants} 
                        />
                      )}
                      <motion.button
                        type="button"
                        onClick={() => handleChoose(category)}
                        onHoverStart={() => setHoveredCategory(category.id)}
                        onHoverEnd={() => setHoveredCategory(null)}
                        className={cn(
                          "relative flex w-full items-center px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer",
                          "transition-colors duration-150",
                          "focus:outline-none",
                          selectedCategory.id === category.id || hoveredCategory === category.id
                            ? "text-[#0F766E]"
                            : "text-slate-600",
                        )}
                        whileTap={{ scale: 0.98 }}
                        variants={itemVariants}
                      >
                        <IconWrapper
                          icon={category.icon}
                          isHovered={hoveredCategory === category.id}
                          color={category.color}
                        />
                        <span className="truncate">{category.label}</span>
                      </motion.button>
                    </React.Fragment>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}

// Default export alias
export const Component = FluidDropdown
