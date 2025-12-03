export default function SmartContractNode({ isActive }: { isActive: boolean }) {
  return (
    <div className={`
      w-24 h-24 rounded-full flex items-center justify-center border-4 
      transition-all duration-700 bg-white relative
      ${isActive 
        ? 'border-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.3)] scale-110' 
        : 'border-gray-200 shadow-sm'
      }
    `}>
      <div className="text-center">
        <div className="text-2xl">⚡</div>
        <div className="text-[9px] text-gray-400 font-bold mt-1 tracking-wider leading-tight">SMART<br/>CONTRACT</div>
      </div>
    </div>
  );
}