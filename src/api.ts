// Placeholder service boundary for a future FastAPI integration.
export const wishApi = {
  async createWish(text: string, anonymous: boolean) { return { text, anonymous, status: 'pending' as const } },
  async getPendingWish() { return null },
  async grantWish(id: string) { return { id, status: 'granted' as const } },
  async getSharedWishes() { return [] as Array<{ id: string; text: string; anonymous: boolean }> },
}
