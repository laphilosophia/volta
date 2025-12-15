import type { VoltaConfig } from './core/api/types'

export const voltaConfig: VoltaConfig = {
  services: {
    jsonPlaceholder: {
      baseUrl: 'https://jsonplaceholder.typicode.com',
      headers: {
        Accept: 'application/json',
      },
    },
  },
  endpoints: {
    // Defines a way to get 10 users
    getUsers: {
      service: 'jsonPlaceholder',
      path: '/users',
      method: 'GET',
      description: 'Fetches a list of system users',
    },
    getPosts: {
      service: 'jsonPlaceholder',
      path: '/posts',
      method: 'GET',
    },
    getPostById: {
      service: 'jsonPlaceholder',
      path: '/posts/:id', // :id will be replaced by params.id
      method: 'GET',
    },
    createPost: {
      service: 'jsonPlaceholder',
      path: '/posts',
      method: 'POST',
      description: 'Creates a new post',
    },
    updatePost: {
      service: 'jsonPlaceholder',
      path: '/posts/:id',
      method: 'PUT',
    },
  },
}
