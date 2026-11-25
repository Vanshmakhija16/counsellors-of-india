/** Use US spelling for American-portal copy while leaving other tenants' copy unchanged. */
export function localizeCounselorSpelling(value: string, isAmerica: boolean): string {
  if (!isAmerica) return value

  return value.replace(/\bcounsellors?\b/gi, (word) => {
    const american = word.replace(/counsellor/i, 'counselor')
    if (word === word.toUpperCase()) return american.toUpperCase()
    if (word[0] === word[0].toUpperCase()) return american[0].toUpperCase() + american.slice(1)
    return american.toLowerCase()
  })
}
