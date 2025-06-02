import { useState, useCallback } from 'react';
import { Developer } from '@/types/developer';
import { developerApi, DeveloperQueryParams, DeveloperListResponse } from '@/api/developer';

export const useDeveloper = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevelopers = useCallback(async (params: DeveloperQueryParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await developerApi.getAllDevelopers(params);
      setDevelopers(response.developers);
      setTotal(response.total);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : '개발자 목록을 불러오는데 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createDeveloper = useCallback(async (data: any) => {
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

  const updateDeveloper = useCallback(async (data: any) => {
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
    total,
    loading,
    error,
    fetchDevelopers,
    createDeveloper,
    updateDeveloper,
    deleteDeveloper
  };
}; 