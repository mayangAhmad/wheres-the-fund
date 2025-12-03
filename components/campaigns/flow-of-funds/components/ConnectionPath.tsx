import { motion } from 'framer-motion';

interface Props { 
  d: string; 
  active: boolean; 
  delay: number; 
  color: string;
}

export default function ConnectionPath({ d, active, delay, color }: Props) {
  return (
    <>
      {/*background gray colour*/}
      <path d={d} stroke="#f3f4f6" strokeWidth="2" fill="none" />
      {/*on top of it the animation*/}
      {/*if active line grows fron 0% (0) -100% (1) over 6s*/}
      <motion.path 
        d={d}
        fill="none"
        stroke={color} 
        strokeWidth="3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut", delay: delay }}
        style={{ strokeLinecap: "round" }}
      />
    </>
  );
}