export default function CodesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            공통 코드 관리
          </h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
            코드 추가
          </button>
        </div>

        {/* 코드 그룹 목록 */}
        <div className="grid gap-6">
          {/* 개발자 직급 코드 */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    개발자 직급 코드
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    DEV_POSITION
                  </p>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                  하위 코드 추가
                </button>
              </div>
              <div className="mt-4">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        코드
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        이름
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        순서
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        사용여부
                      </th>
                      <th className="relative px-4 py-2">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        P001
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        시니어 개발자
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        1
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          사용
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            수정
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        P002
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        주니어 개발자
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        2
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          사용
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            수정
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 프로젝트 상태 코드 */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    프로젝트 상태 코드
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    PRJ_STATUS
                  </p>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                  하위 코드 추가
                </button>
              </div>
              <div className="mt-4">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        코드
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        이름
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        순서
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        사용여부
                      </th>
                      <th className="relative px-4 py-2">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        S001
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        진행중
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        1
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          사용
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            수정
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        S002
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        완료
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                        2
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          사용
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            수정
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
