// History auto-import removed for prod — users import via Settings
export async function loadHistoryIntoDb() {
  return { imported: 0, existing: 0 };
}

export async function clearAndReloadHistory() {
  return { imported: 0 };
}
