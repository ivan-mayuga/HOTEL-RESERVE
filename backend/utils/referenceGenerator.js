export async function generate(prefix, Model, field) {
  const docs = await Model.find({ [field]: new RegExp(`^${escapeRegex(prefix)}\\d{4}$`, 'i') })
    .select(field)
    .lean()

  const max = docs.reduce((highest, doc) => {
    const raw = String(doc[field] || '')
    const suffix = raw.replace(prefix, '')
    const number = Number.parseInt(suffix, 10)
    return Number.isFinite(number) && number > highest ? number : highest
  }, 0)

  return `${prefix}${String(max + 1).padStart(4, '0')}`
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
