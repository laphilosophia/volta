import { createColumnHelper } from '@tanstack/react-table';
import React, { useState } from 'react';
import { z } from 'zod';
import { useVoltaQuery } from '../hooks/useVoltaQuery';
import { ActionForm } from './headless/ActionForm';
import { HeadlessDataTable } from './headless/DataTable';

interface User {
  id: number;
  name: string;
  email: string;
  company: { name: string };
}

interface Post {
  id: number;
  title: string;
  body: string;
}

// Zod Schema for Creating a Post
const createPostSchema = z.object({
  title: z.string().min(3, 'Title is too short'),
  body: z.string().min(10, 'Body is too short'),
  userId: z.coerce.number().default(1),
});

export const HeadlessDemo: React.FC = () => {
  const [postId, setPostId] = useState(1);

  // Column definitions for Headless Table
  const columnHelper = createColumnHelper<User>();
  const columns = [
    columnHelper.accessor('id', { header: 'ID', cell: info => info.getValue() }),
    columnHelper.accessor('name', { header: 'Name', cell: info => <span className="font-medium">{info.getValue()}</span> }),
    columnHelper.accessor('email', { header: 'Email' }),
    columnHelper.accessor('company.name', { header: 'Company' }),
  ];

  // 1. Fetching a single item with params (GET /posts/:id)
  const { data: post, isLoading: postLoading } = useVoltaQuery<Post>('getPostById', { id: postId });

  return (
    <div className="p-8 space-y-12 bg-(--color-background) min-h-screen text-(--color-text-primary)">

      <div className="border-b border-(--color-border) pb-4 space-y-2">
        <h1 className="text-3xl font-bold text-(--color-primary)">⚡ Volta Headless Primitives</h1>
        <p className="text-(--color-text-secondary)">
          Building UI blocks directly from <code>voltaboard.config.ts</code> + Zod Schemas.
        </p>
      </div>

      {/* Headless Data Table Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="p-1 bg-blue-100 text-blue-700 rounded text-xs px-2">READ</span>
          Config-Driven Table
        </h2>
        <p className="text-sm text-(--color-text-secondary)">
          <code>{`<HeadlessDataTable endpoint="getUsers" />`}</code> - Fetches, maps, and renders.
        </p>

        <HeadlessDataTable
          endpoint="getUsers"
          columns={columns}
          onRowClick={(user) => alert(`Clicked user: ${user.name}`)}
        />
      </section>

      {/* Headless Action Form Section */}
      <section className="space-y-4 pt-8 border-t border-(--color-border)">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="p-1 bg-green-100 text-green-700 rounded text-xs px-2">WRITE</span>
          Schema-Driven Form
        </h2>
        <p className="text-sm text-(--color-text-secondary)">
          <code>{`<ActionForm endpoint="createPost" schema={zodSchema} />`}</code> - Validates (Zod) and Submits (Mutation).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <ActionForm
              title="Create New Post"
              endpoint="createPost"
              schema={createPostSchema}
              onSuccess={(data) => console.log('Post created:', data)}
            />
          </div>

          {/* Existing dynamic fetch demo */}
          <div className="space-y-4 p-6 bg-(--color-surface-hover) rounded-lg border border-(--color-border)">
            <h3 className="font-semibold text-lg">Live Preview (GET /posts/:id)</h3>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setPostId(p => Math.max(1, p - 1))} className="px-2 py-1 bg-white border rounded">Prev</button>
              <span className="font-mono">{postId}</span>
              <button onClick={() => setPostId(p => p + 1)} className="px-2 py-1 bg-white border rounded">Next</button>
            </div>
            {postLoading ? (
              <div className="animate-pulse">Loading...</div>
            ) : post ? (
              <div>
                <h4 className="font-bold capitalize">{post.title}</h4>
                <p className="text-sm mt-2">{post.body}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};
