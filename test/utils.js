export const isError = fn => {
  try {
    fn()
  } catch (err) {
    return true
  }
  return false
}