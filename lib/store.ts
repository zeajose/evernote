import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NoteState {
  content: string;
  setContent: (content: string) => void;
  appendContent: (text: string) => void;
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set) => ({
      content: '',
      setContent: (content) => set({ content }),
      appendContent: (text) => set((state) => ({ 
        content: state.content + text 
      })),
    }),
    {
      name: 'note-storage',
    }
  )
);
