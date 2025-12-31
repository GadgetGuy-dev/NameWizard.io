// Animation variants for Framer Motion
// Provides consistent animations across the application

import type { Variants } from 'framer-motion';

// Fade in animation with slight scaling
export const fadeInScale: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// Slide and fade from bottom
export const slideUp: Variants = {
  hidden: { 
    opacity: 0,
    y: 10 
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

// Slide and fade from right
export const slideInRight: Variants = {
  hidden: { 
    opacity: 0,
    x: 20 
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.25,
      ease: 'easeIn'
    }
  }
};

// Slide and fade from left
export const slideInLeft: Variants = {
  hidden: { 
    opacity: 0,
    x: -20 
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.25,
      ease: 'easeIn'
    }
  }
};

// Pulse animation for attention
export const pulse: Variants = {
  hidden: { 
    scale: 1
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
      times: [0, 0.5, 1]
    }
  }
};

// Bounce animation for interactions
export const bounce: Variants = {
  tap: { 
    scale: 0.95,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 17
    }
  },
  hover: { 
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  }
};

// Staggered children animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1
    }
  }
};

// Item animation for use within staggered containers
export const staggerItem: Variants = {
  hidden: { 
    opacity: 0,
    y: 15 
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
};

// Toast notification slide animation
export const toastSlide: Variants = {
  hidden: { 
    opacity: 0,
    y: -20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 22
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

// Success state animation (checkmark)
export const successState: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
    rotate: -5
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15
    }
  }
};

// Card hover effect
export const cardHover: Variants = {
  hover: {
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

// Button hover effect
export const buttonHover: Variants = {
  hover: {
    scale: 1.03,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  tap: {
    scale: 0.97
  }
};

// File upload drop area animation
export const dropAreaActive: Variants = {
  inactive: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    transition: {
      duration: 0.2
    }
  },
  active: {
    borderColor: 'rgba(255, 138, 0, 0.7)',
    backgroundColor: 'rgba(255, 138, 0, 0.05)',
    scale: 1.01,
    transition: {
      duration: 0.2
    }
  }
};