import {
  createClient,
  LiveList,
  LiveMap,
  LiveObject,
} from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import { Layer, ReactionEvent } from "./types/type";
import type { ProjectData } from "grapesjs";

// Determinar el entorno actual
const isDevelopment = process.env.NODE_ENV === "development";

// Configurar el cliente con la clave apropiada según el entorno
const client = createClient({
  publicApiKey: isDevelopment
    ? process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!
    : process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY_PRODUCTION!,
});

// Ejemplo de tipados del estado compartido
export type Presence = {
  cursor: { x: number; y: number } | null;
  cursorColor: string | null;
  selectedComponent: string | null;
  editingComponent: string | null;
};

// Tipos para operaciones granulares
export type ComponentOperation = {
  id: string;
  type: "add" | "remove" | "update" | "move" | "style";
  componentId: string;
  data?: any;
  timestamp: number;
  userId: string;
};

export type StyleOperation = {
  id: string;
  type: "add" | "remove" | "update";
  selectorText: string;
  property?: string;
  value?: string;
  timestamp: number;
  userId: string;
};

type Storage = {
  // Tu estructura actual - mantener compatibilidad
  editorData: {
    projectData: ProjectData;
    lastUpdated: number;
    lastEditor: string;
  };

  // NUEVA estructura granular - inicializar como objetos vacios si no existen
  components: LiveMap<string, any>;
  styles: LiveMap<string, any>;
  operations: LiveList<ComponentOperation | StyleOperation>;

  // Configuración del proyecto
  projectConfig: LiveObject<{
    activePageId: string;
    projectName: string;
    lastSaved: number;
  }>;
};

type UserMeta = {
  id: string;
  info: {
    name: string;
    email: string;
    avatar: string;
  };
};

type RoomEvent = {
  type: "component-selected" | "component-edited" | "cursor-moved";
  data: any;
};

export type ThreadMetadata = {
  resolved: boolean;
  zIndex: number;
  time?: number;
  x: number;
  y: number;
};

// Configuración de la sala (Room) sin las opciones que se han movido a createClient
export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useObject,
    useMap,
    useList,
    useBatch,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStatus,
    useLostConnectionListener,
    useThreads,
    useUser,
    useCreateThread,
    useEditThreadMetadata,
    useCreateComment,
    useEditComment,
    useDeleteComment,
    useAddReaction,
    useRemoveReaction,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(
  client
);
