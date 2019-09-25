export const isError = fn => {
  try {
    fn()
  } catch (err) {
    return true
  }
  return false
}

export const clone = (obj, record = new WeakMap()) => {
  if (!obj) return obj
  if (obj instanceof Date) return obj
  if (record.has(obj)) return record.get(obj)

  const filterTypes = ['string', 'number', 'boolean', 'function']
  if (filterTypes.includes(typeof obj)) return obj

  const res = typeof obj.constructor !== 'function'
    ? Object.create(null) 
    : new obj.constructor()

  record.set(obj, res)

  for (const key in obj) {
    res[key] = clone(obj[key], record)
  }
  return res
}