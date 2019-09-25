export const warn = (message, isWarn) => {
  const message = `\n[ReportSDK warn]: ${message}\n\n`
  if (isWarn) {
    console.warn(message)
    return
  }
  throw new Error(message)
}

export const assert = (condition, error) => {
  if (condition) {
    warn(error)
  }
}

export const callHook = (hooks, name, params) => {
  if (hooks && typeof hooks[name] === 'function') {
    return hooks[name].apply(hooks, params)
  }
}