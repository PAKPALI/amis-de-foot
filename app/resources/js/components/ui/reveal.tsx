import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';

type RevealProps = HTMLMotionProps<'div'> & {
    delay?: number;
};

export function Reveal({ children, delay = 0, ...props }: RevealProps) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            {...props}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}
