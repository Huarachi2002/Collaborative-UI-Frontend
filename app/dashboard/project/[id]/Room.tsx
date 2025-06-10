"use client";

import Loader from "@/components/Loader";
import { RoomProvider } from "@/liveblocks.config";
import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";
import { ReactNode } from "react";

export default function Room({
  children,
  projectId,
}: {
  children: ReactNode;
  projectId: string;
}) {
  const roomId = `project-${projectId}`;

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        cursorColor: null,
        selectedComponent: null,
        editingComponent: null,
      }}
      initialStorage={{
        // Mantener la estructura existente
        editorData: {
          projectData: {} as any,
          lastUpdated: 0,
          lastEditor: "",
        },
        // Inicializar las nuevas estructuras granulares
        components: new LiveMap(),
        styles: new LiveMap(),
        operations: new LiveList(),
        projectConfig: new LiveObject({
          activePageId: "",
          projectName: "",
          lastSaved: 0,
        }),
      }}
    >
      <ClientSideSuspense fallback={<Loader />}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
