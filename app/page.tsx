'use client';

import { Editor } from '@/components/editor';

export default function Page() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <main className="flex-1 relative h-full overflow-hidden flex flex-col">
        <Editor />
      </main>
    </div>
  );
}
