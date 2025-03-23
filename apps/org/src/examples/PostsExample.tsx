'use client';

import { useState } from 'react';
import {
  useApiQuery,
  useApiMutation,
  useApiPutMutation,
  get,
  post,
  put,
  del,
} from '../lib/api';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

/**
 * Posts API를 사용하는 예제 컴포넌트
 * 백엔드 Nest.js API와 통신하는 방법을 보여줍니다
 */
export default function PostsExample() {
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // React Query로 포스트 데이터 가져오기
  const {
    data: posts,
    isLoading,
    refetch,
  } = useApiQuery<Post[]>(['posts'] as const, '/posts', {
    params: { _limit: 5 },
    revalidate: 30, // 30초마다 재검증
  });

  // 새 포스트 추가 뮤테이션
  const addPostMutation = useApiMutation<
    Post,
    { title: string; body: string; userId: number }
  >('/posts', {
    onSuccess: () => {
      refetch();
      setNewPostTitle('');
      setNewPostBody('');
    },
  });

  // 포스트 업데이트 뮤테이션
  const updatePostMutation = useApiPutMutation<
    Post,
    { title?: string; body?: string; userId?: number }
  >(`/posts/${editingPost?.id}`, {
    onSuccess: () => {
      refetch();
      setEditingPost(null);
    },
  });

  // 포스트 추가 핸들러
  const handleAddPost = async () => {
    if (!newPostTitle.trim() || !newPostBody.trim()) return;

    addPostMutation.mutate({
      title: newPostTitle,
      body: newPostBody,
      userId: 1, // 현재 로그인한 사용자 ID (예시)
    });
  };

  // 포스트 수정 모드 설정
  const handleSetEditMode = (post: Post) => {
    setEditingPost(post);
  };

  // 포스트 업데이트 핸들러
  const handleUpdatePost = () => {
    if (!editingPost) return;

    updatePostMutation.mutate({
      title: editingPost.title,
      body: editingPost.body,
    });
  };

  // 포스트 삭제 핸들러
  const handleDeletePost = (postId: number) => {
    if (window.confirm('정말 이 포스트를 삭제하시겠습니까?')) {
      // 직접 API 호출을 사용하여 포스트 삭제
      del(`/posts/${postId}`)
        .then(() => {
          refetch(); // 성공 시 포스트 목록 갱신
        })
        .catch((error) => {
          console.error('포스트 삭제 실패:', error);
        });
    }
  };

  // 직접 API 호출 예시
  const handleDirectApiCall = async () => {
    try {
      // 포스트 목록 가져오기
      const result = await get<Post[]>('/posts', {
        params: { _limit: 3 },
        revalidate: 0, // 캐싱 없음
      });
      console.log('직접 API 호출 결과:', result);

      // 새 포스트 추가
      const newPost = await post<Post>('/posts', {
        title: 'API 직접 호출로 추가된 포스트',
        body: '이 포스트는 직접 API 호출로 추가되었습니다.',
        userId: 1,
      });
      console.log('새 포스트 추가됨:', newPost);

      // 포스트 업데이트
      if (result && result.length > 0) {
        const updateResult = await put<Post>(`/posts/${result[0].id}`, {
          title: '업데이트된 제목',
          body: result[0].body,
        });
        console.log('포스트 업데이트됨:', updateResult);

        // 포스트 삭제 예시 (주석 처리)
        // await del(`/posts/${result[0].id}`);
        // console.log('포스트 삭제됨');
      }

      // 목록 다시 가져오기
      refetch();
    } catch (error) {
      console.error('API 호출 오류:', error);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">포스트 API 예제</h1>

      {!editingPost ? (
        <div className="mb-6">
          <div className="mb-4">
            <input
              type="text"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder="제목 입력"
              className="w-full border rounded px-3 py-2 mb-2"
            />
            <textarea
              value={newPostBody}
              onChange={(e) => setNewPostBody(e.target.value)}
              placeholder="내용 입력"
              className="w-full border rounded px-3 py-2 h-24"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddPost}
              disabled={
                addPostMutation.isPending ||
                !newPostTitle.trim() ||
                !newPostBody.trim()
              }
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 flex-1"
            >
              {addPostMutation.isPending ? '추가 중...' : '포스트 추가'}
            </button>

            <button
              onClick={handleDirectApiCall}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              API 직접 호출
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="mb-4">
            <input
              type="text"
              value={editingPost.title}
              onChange={(e) =>
                setEditingPost({ ...editingPost, title: e.target.value })
              }
              placeholder="제목 입력"
              className="w-full border rounded px-3 py-2 mb-2"
            />
            <textarea
              value={editingPost.body}
              onChange={(e) =>
                setEditingPost({ ...editingPost, body: e.target.value })
              }
              placeholder="내용 입력"
              className="w-full border rounded px-3 py-2 h-24"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleUpdatePost}
              disabled={updatePostMutation.isPending}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300 flex-1"
            >
              {updatePostMutation.isPending ? '수정 중...' : '포스트 수정'}
            </button>

            <button
              onClick={() => setEditingPost(null)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              취소
            </button>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">포스트 목록</h2>
        {isLoading ? (
          <p className="text-gray-500">로딩 중...</p>
        ) : posts && posts.length > 0 ? (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.id} className="p-3 border rounded">
                <h3 className="font-bold">{post.title}</h3>
                <p className="text-gray-700 text-sm mt-1">{post.body}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleSetEditMode(post)}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">포스트가 없습니다.</p>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>
          이 컴포넌트는 Nest.js로 구현된 백엔드 API를 호출하는 방법을
          보여줍니다. 통합 API 시스템을 사용하여 서버와 쉽게 통신할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
