// import the correct RootState type from your store
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { User } from "../contexts/UserContext"
import type { RootState } from '../store/store'
import type { Book, BookWithDetails, JournalEntry, Tag, UpdateBookRequest } from "../types"

// Define our API slice
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    prepareHeaders: (headers, {getState}) => {
        const state = getState() as RootState
        const currentUserId = state.user?.currentUser?.id
        if (currentUserId) {
          headers.set('currentUserId', currentUserId.toString())
        }
      // Set content type
      headers.set('Content-Type', 'application/json')
      
      return headers
    },
  }),
  tagTypes: ['Book', 'JournalEntry', 'Tag', 'User'],
  endpoints: (builder) => ({
    // #region Book Endpoints
    getBooks: builder.query<Book[], { search?: string } | void>({
      query: (params) => {
        const search = params && typeof params === 'object' && 'search' in params ? params.search : undefined
        return search ? `/books?search=${encodeURIComponent(search)}` : '/books'
      },
      providesTags: (_result, _error, params) => {
        const search = params && typeof params === 'object' && 'search' in params ? params.search : undefined
        return search ? [{ type: 'Book', id: `search-${search}` }] : [{ type: 'Book', id: 'all' }]
      },
      keepUnusedDataFor: 0, // Don't cache unused data
    }),
    
    getBook: builder.query<BookWithDetails, string>({
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

    updateBook: builder.mutation<BookWithDetails, { id: number; book: UpdateBookRequest }>({
      query: ({ id, book }) => ({
        url: `/books/${id}`,
        method: 'PUT',
        body: book,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Book', id: id.toString() },
        { type: 'Book', id: 'all' },
        'Book'
      ],
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
        body: { id: userId }, // Backend expects 'id', not 'userId'
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
  useUpdateBookMutation,
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
