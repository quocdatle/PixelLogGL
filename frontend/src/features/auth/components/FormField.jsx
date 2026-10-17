// Input dùng chung cho form trong module auth — hỗ trợ cả Light Mode và Dark Gaming Mode
export default function FormField({
  label,
  id,
  error,
  icon,
  rightElement,
  labelAction,
  ...inputProps
}) {
  return (
    <div className="mb-4">
      {(label || labelAction) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label
              htmlFor={id}
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {label}
            </label>
          )}
          {labelAction && <div>{labelAction}</div>}
        </div>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            {icon}
          </div>
        )}

        <input
          id={id}
          className={`w-full ${icon ? 'pl-10' : 'pl-3.5'} ${
            rightElement ? 'pr-10' : 'pr-3.5'
          } py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 dark:focus:ring-indigo-500/20 transition-all duration-200`}
          {...inputProps}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
