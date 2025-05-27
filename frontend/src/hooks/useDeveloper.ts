import { useState, useCallback } from 'react';
import { Developer, DeveloperCreateInput, DeveloperUpdateInput } from '@/types/developer';
import { developerApi } from '@/api/developer';

export const useDeveloper = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevelopers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await developerApi.getAllDevelopers();
      setDevelopers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '개발자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createDeveloper = useCallback(async (data: DeveloperCreateInput) => {
    try {
      setLoading(true);
      setError(null);
      const newDeveloper = await developerApi.createDeveloper(data);
      setDevelopers(prev => [...prev, newDeveloper]);
      return newDeveloper;
    } catch (err) {
      setError(err instanceof Error ? err.message : '개발자 생성에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDeveloper = useCallback(async (data: DeveloperUpdateInput) => {
    try {
      setLoading(true);
      setError(null);
      const updatedDeveloper = await developerApi.updateDeveloper(data);
      setDevelopers(prev => 
        prev.map(dev => dev.developer_id === data.developer_id ? updatedDeveloper : dev)
      );
      return updatedDeveloper;
    } catch (err) {
      setError(err instanceof Error ? err.message : '개발자 정보 수정에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDeveloper = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await developerApi.deleteDeveloper(id);
      setDevelopers(prev => prev.filter(dev => dev.developer_id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '개발자 삭제에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    developers,
    loading,
    error,
    fetchDevelopers,
    createDeveloper,
    updateDeveloper,
    deleteDeveloper
  };
}; 