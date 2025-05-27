import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            개발자 관리 시스템
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            효율적인 개발자 및 프로젝트 관리를 위한 통합 플랫폼
          </p>
        </header>

        <main className="space-y-12">
          {/* HRM 섹션 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 p-2 rounded-lg mr-3">
                HRM
              </span>
              개발자 관리
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 개발자 목록 카드 */}
              <Link
                href="/developers"
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-blue-600 dark:text-blue-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    개발자 목록
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                    개발자 목록 조회 및 이력서 관리
                  </p>
                </div>
              </Link>

              {/* 이력서 관리 카드 */}
              <Link
                href="/resumes"
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-green-600 dark:text-green-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    이력서 관리
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                    이력서 업로드, 파싱 및 데이터 관리
                  </p>
                </div>
              </Link>

              {/* 기술 스택 관리 카드 */}
              <Link
                href="/skills"
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-yellow-600 dark:text-yellow-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    기술 스택
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                    기술 스택 검색 및 관리
                  </p>
                </div>
              </Link>
            </div>
          </section>

          {/* PM 섹션 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 p-2 rounded-lg mr-3">
                PM
              </span>
              프로젝트 관리
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 프로젝트 관리 카드 */}
              <Link
                href="/projects"
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-purple-600 dark:text-purple-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    프로젝트 관리
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                    프로젝트 생성, 수정, 삭제 및 조회
                  </p>
                </div>
              </Link>

              {/* 개발자 배정 카드 */}
              <Link
                href="/assignments"
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-indigo-600 dark:text-indigo-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    개발자 배정
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                    프로젝트 참여 개발자 관리
                  </p>
                </div>
              </Link>

              {/* 공통 코드 관리 카드 */}
              <Link
                href="/codes"
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-red-600 dark:text-red-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    공통 코드
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                    개발 언어, 시스템, 업체 등 관리
                  </p>
                </div>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
