import { create } from 'zustand';
import { StateCreator } from 'zustand';
import { ProjectDeveloper, SearchParams } from '@/types/project';

interface SearchState {
  query: string;
  page: number;
  developers: ProjectDeveloper[];
  hasMore: boolean;
  isSearching: boolean;
}

interface SearchStore {
  searchState: SearchState;
  setSearchState: (state: Partial<SearchState>) => void;
  resetSearchState: () => void;
  searchDevelopers: (params: SearchParams, page: number) => Promise<void>;
}

const initialState: SearchState = {
  query: '',
  page: 1,
  developers: [],
  hasMore: false,
  isSearching: false
};

const createSearchStore: StateCreator<SearchStore> = (set) => ({
  searchState: initialState,
  
  setSearchState: (newState: Partial<SearchState>) => {
    set((state) => ({
      searchState: { ...state.searchState, ...newState }
    }));
  },

  resetSearchState: () => {
    set({ searchState: initialState });
  },

  searchDevelopers: async (params: SearchParams, page: number) => {
    try {
      set((state) => ({
        searchState: { 
          ...state.searchState, 
          isSearching: true,
          developers: page === 1 ? [] : state.searchState.developers
        }
      }));

      const searchQuery = params.developer_name || '';
      const queryParams = new URLSearchParams({
        developer_name: searchQuery,
        page: String(page)
      });
      
      console.log('API 요청:', {
        url: `http://localhost:4000/api/projects/developers?${queryParams}`,
        params: {
          developer_name: searchQuery,
          page: page
        }
      });
      
      const response = await fetch(`http://localhost:4000/api/projects/developers?${queryParams}`);
      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API 응답:', data);

      set((state) => ({
        searchState: {
          ...state.searchState,
          query: searchQuery,
          page: page,
          developers: page === 1 
            ? data.developers 
            : [...state.searchState.developers, ...data.developers],
          hasMore: data.hasMore,
          isSearching: false
        }
      }));
    } catch (error) {
      console.error('개발자 검색 중 오류 발생:', error);
      set((state) => ({
        searchState: {
          ...state.searchState,
          isSearching: false
        }
      }));
      throw error;
    }
  }
});

export const useSearchStore = create(createSearchStore); 