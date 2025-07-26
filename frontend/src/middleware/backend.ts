import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { User } from "../contexts/UserContext"
import type { Book, JournalEntry, Tag } from "../types"

// Define our API slice
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    prepareHeaders: (headers) => {
      // Set content type
      headers.set('Content-Type', 'application/json')
      
      // Get current user from localStorage and set currentUserId header
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        try {
          const currentUser = JSON.parse(storedUser)
          if (currentUser?.id) {
            headers.set('currentUserId', currentUser.id.toString())
          }
        } catch (error) {
          console.warn('Failed to parse stored user:', error)
        }
      }
      
      return headers
    },
  }),
  tagTypes: ['Book', 'JournalEntry', 'Tag', 'User'],
  endpoints: (builder) => ({
    // #region Book Endpoints
    getBooks: builder.query<Book[], void>({
      query: () => '/books',
      providesTags: ['Book'],
    }),
    
    getBook: builder.query<Book, string>({
      query: (id) => `/books/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Book', id }],
    }),
    
    addBook: builder.mutation<Book, Omit<Book, 'id'>>({
      query: (book) => ({
        url: '/books',
        method: 'POST',
        body: book,
      }),
      invalidatesTags: ['Book'],
    }),
    //#endregion

    //#region Journal Endpoints
    getBookJournals: builder.query<JournalEntry[], number>({
      query: (bookId) => `/books/${bookId}/journals`,
      providesTags: (_result, _error, bookId) => [
        { type: 'JournalEntry', id: `book-${bookId}` },
      ],
    }),

    getJournals: builder.query<JournalEntry[], void>({
      query: () => '/journals',
      providesTags: ['JournalEntry'],
    }),

    getJournal: builder.query<JournalEntry, number>({
      query: (id) => `/journals/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'JournalEntry', id }],
    }),

    addJournalEntry: builder.mutation<JournalEntry, { 
      bookId: number; 
      entry: Omit<JournalEntry, 'id' | 'book_id' | 'created_at' | 'updated_at'>; 
    }>({
      query: ({ bookId, entry }) => ({
        url: `/books/${bookId}/journals`,
        method: 'POST',
        body: entry,
      }),
      invalidatesTags: (_result, _error, { bookId }) => [
        { type: 'JournalEntry', id: `book-${bookId}` },
        'JournalEntry',
      ],
    }),
    //#endregion

    //#region Tag Endpoints
    getTags: builder.query<Tag[], { name?: string } | void>({
      query: (params) => {
        const name = params && typeof params === 'object' && 'name' in params ? params.name : undefined
        return name ? `/tags?name=${encodeURIComponent(name)}` : '/tags'
      },
      providesTags: ['Tag'],
    }),

    getTag: builder.query<Tag, number>({
      query: (id) => `/tags/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Tag', id }],
    }),

    addTag: builder.mutation<Tag, { name: string; color: string }>({
      query: (tag) => ({
        url: '/tags',
        method: 'POST',
        body: tag,
      }),
      invalidatesTags: ['Tag'],
    }),

    updateTag: builder.mutation<Tag, { 
      id: number; 
      tag: { name: string; color: string }; 
    }>({
      query: ({ id, tag }) => ({
        url: `/tags/${id}`,
        method: 'PUT',
        body: tag,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Tag', id }, 'Tag'],
    }),

    deleteTag: builder.mutation<void, number>({
      query: (id) => ({
        url: `/tags/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Tag', id }, 'Tag'],
    }),
    //#endregion

    //#region User Endpoints
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),

    selectUser: builder.mutation<User, number>({
      query: (userId) => ({
        url: '/users/select',
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: ['User'],
    }),
    //#endregion
  }),
})

// Export hooks for usage in functional components
export const {
  useGetBooksQuery,
  useGetBookQuery,
  useAddBookMutation,
  useGetBookJournalsQuery,
  useGetJournalsQuery,
  useGetJournalQuery,
  useAddJournalEntryMutation,
  useGetTagsQuery,
  useGetTagQuery,
  useAddTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
  useGetUsersQuery,
  useSelectUserMutation,
} = api
