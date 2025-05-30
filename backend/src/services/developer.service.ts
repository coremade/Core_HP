import { pool } from '../config/db.config';
import { Developer } from '../types/developer.types';
import fs from 'fs';
import path from 'path';

// SQL 쿼리 파일 읽기
const queries = {
  getDevelopers: fs.readFileSync(
    path.join(__dirname, '../queries/developer.queries.sql'),
    'utf-8'
  ).split(';')[0],
  getTotalCount: fs.readFileSync(
    path.join(__dirname, '../queries/developer.queries.sql'),
    'utf-8'
  ).split(';')[1],
  getDeveloperById: fs.readFileSync(
    path.join(__dirname, '../queries/developer.queries.sql'),
    'utf-8'
  ).split(';')[2],
};

export class DeveloperService {
  async getDevelopers(params: { page: number; pageSize: number; searchKeyword: string }) {
    const { page, pageSize, searchKeyword } = params;
    const offset = (page - 1) * pageSize;

    try {
      // 개발자 목록 조회
      const [developers] = await pool.query(queries.getDevelopers, [
        searchKeyword,
        searchKeyword,
        searchKeyword,
        searchKeyword,
        pageSize,
        offset,
      ]);

      // 전체 개발자 수 조회
      const [totalResult] = await pool.query(queries.getTotalCount, [
        searchKeyword,
        searchKeyword,
        searchKeyword,
        searchKeyword,
      ]);
      const total = totalResult[0].total;

      return {
        developers,
        total,
        page,
        pageSize,
      };
    } catch (error) {
      console.error('Error fetching developers:', error);
      throw new Error('Failed to fetch developers');
    }
  }

  async getDeveloperById(id: string) {
    try {
      const [results] = await pool.query(queries.getDeveloperById, [id]);
      if (results.length === 0) {
        throw new Error('Developer not found');
      }
      return results[0];
    } catch (error) {
      console.error('Error fetching developer by id:', error);
      throw new Error('Failed to fetch developer details');
    }
  }
} 