import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Note {
  _id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface NotesState {
  list: Note[]
}

const notesSlice = createSlice({
  name: 'notes',
  initialState: { list: [] } as NotesState,
  reducers: {
    setNotes(_state, action: PayloadAction<Note[]>) {
      return { list: action.payload }
    },
    addNote(state, action: PayloadAction<Note>) {
      state.list.push(action.payload)
    },
    updateNote(state, action: PayloadAction<Note>) {
      const idx = state.list.findIndex(n => n._id === action.payload._id)
      if (idx >= 0) state.list[idx] = action.payload
    },
    removeNote(state, action: PayloadAction<string>) {
      state.list = state.list.filter(n => n._id !== action.payload)
    }
  }
})

export const { setNotes, addNote, updateNote, removeNote } = notesSlice.actions
export default notesSlice.reducer
