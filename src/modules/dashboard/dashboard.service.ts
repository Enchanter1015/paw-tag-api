import { dashboardRepository } from './dashboard.repository.js';

const RECENT_ANIMALS_LIMIT = 10;

export const dashboardService = {
  getStats: async () => {
    const now = new Date();
    const [totalAnimals, vaccinatedAnimals, vaccinationDueAnimals, recentAnimals] = await Promise.all([
      dashboardRepository.countAnimals(),
      dashboardRepository.countVaccinatedAnimals(),
      dashboardRepository.countVaccinationDueAnimals(now),
      dashboardRepository.listRecentAnimals(RECENT_ANIMALS_LIMIT),
    ]);

    return { totalAnimals, vaccinatedAnimals, vaccinationDueAnimals, recentAnimals };
  },
};
