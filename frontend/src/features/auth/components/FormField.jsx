// Input dung chung cho form trong module auth
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
              className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              {label}
            </label>
          )}
          {labelAction && <div>{labelAction}</div>}
        </div>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            {icon}
          </div>
        )}

        <input
          id={id}
          className={`w-full ${icon ? "pl-10" : "pl-3.5"} ${
            rightElement ? "pr-10" : "pr-3.5"
          } py-2.5 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-150`} /* taste-skill-ignore: real form field input border */
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
