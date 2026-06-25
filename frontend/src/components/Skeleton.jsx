export const Skeleton = ({ className = '', variant = 'text', width, height }) => {
  const baseClasses = 'animate-shimmer rounded bg-surface-variant/30';
  
  let variantClasses = '';
  if (variant === 'circle') {
    variantClasses = 'rounded-full';
  } else if (variant === 'card') {
    variantClasses = 'rounded-xl border border-border-muted/30';
  }
  
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div 
      className={`${baseClasses} ${variantClasses} ${className}`} 
      style={style}
    />
  );
};

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`glass-card border border-border-muted rounded-xl p-6 flex flex-col justify-between h-[116px] shadow-sm overflow-hidden relative ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <Skeleton width="40%" height="16px" />
        <Skeleton width="20px" height="20px" variant="circle" />
      </div>
      <div className="flex items-end gap-3 mt-auto">
        <Skeleton width="60%" height="32px" />
      </div>
    </div>
  );
};

export const SkeletonTimeline = () => {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative pl-6">
          <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-bg-card border-2 border-border-muted flex items-center justify-center"></span>
          <div className="flex justify-between items-start mb-2">
            <Skeleton width="50%" height="16px" />
            <Skeleton width="60px" height="12px" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Skeleton width="80px" height="18px" />
            <Skeleton width="100px" height="18px" />
          </div>
          <Skeleton className="mt-2" width="90%" height="14px" />
          <Skeleton className="mt-1" width="70%" height="14px" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonTable = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between border-b border-border-muted pb-3">
        <Skeleton width="25%" height="16px" />
        <Skeleton width="15%" height="16px" />
        <Skeleton width="15%" height="16px" />
        <Skeleton width="20%" height="16px" />
        <Skeleton width="10%" height="16px" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between py-4 items-center">
          <Skeleton width="25%" height="18px" />
          <Skeleton width="12%" height="20px" />
          <Skeleton width="15%" height="18px" />
          <Skeleton width="18%" height="14px" />
          <Skeleton width="10%" height="28px" />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
