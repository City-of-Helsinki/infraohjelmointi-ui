import { IProjectCardsResponse } from '@/interfaces/projectCardInterfaces';
import mockProjectCard from './mockProjectCard';

const mockProjectCards: { data: IProjectCardsResponse } = {
  data: {
    count: 200,
    results: [mockProjectCard.data],
  },
};

export default mockProjectCards;
