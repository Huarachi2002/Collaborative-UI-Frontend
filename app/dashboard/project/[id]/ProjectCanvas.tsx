"use client";

// import Live from "@/components/Live";
import { useEffect, useState } from "react";
import {
  useMutation,
  useMyPresence,
  useOthers,
  useRedo,
  useStorage,
  useUndo,
} from "@/liveblocks.config";
// import { v4 as uuidv4 } from "uuid";
import { useParams } from "next/navigation";
import GrapesJsStudio, {
  StudioCommands,
  ToastVariant,
} from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import { Editor, ProjectData } from "grapesjs";
import {
  tableComponent,
  listPagesComponent,
  fsLightboxComponent,
  lightGalleryComponent,
  swiperComponent,
  iconifyComponent,
  accordionComponent,
  flexComponent,
  rteTinyMce,
  canvasGridMode,
  layoutSidebarButtons,
} from "@grapesjs/studio-sdk-plugins";
import { registerFlutterWidgets } from "@/components/projects/flutter-widgets";
import { registerFlutterFormComponents } from "@/components/projects/flutter-forms";
import { useGrapesJSCollaboration } from "@/hooks/useGrapesJSCollaboration";

interface EditorState {
  projectData: ProjectData;
  lastUpdated: number;
  lastEditor: string;
}

export default function ProjectCanvas() {
  const params = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  // Hook para deshacer/rehacer
  const undo = useUndo();
  const redo = useRedo();

  // Estado para el editor
  const [editor, setEditor] = useState<Editor>();
  const [editorReady, setEditorReady] = useState(false);

  const editorData = useStorage((root) => root.editorData);

  // Ver usuarios conectados (útil para mostrar quién está editando)
  const others = useOthers();
  const [{ selectedComponent }, updateMyPresence] = useMyPresence();

  // Generar un ID único para este usuario
  const [userId] = useState(
    `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  );

  // Hook personalizado para colaboración granular
  const { setupGranularEvents, isApplyingRemoteChange } =
    useGrapesJSCollaboration(editor, userId);

  // Mutación para sincronizar cambios con LiveBlocks
  const syncEditorChanges = useMutation(({ storage }, data: EditorState) => {
    console.log("Sincronizando cambios con LiveBlocks:", data);
    storage.set("editorData", data);
  }, []);

  // Función que se ejecuta cuando el editor está listo
  const onReady = (editor: Editor) => {
    console.log("Editor GrapesJS cargado correctamente", editor);
    setEditor(editor);

    if (editorData && editorData.projectData) {
      try {
        console.log(
          "Cargando datos existentes desde Liveblocks...",
          editorData
        );

        // Cargar el proyecto completo desde Liveblocks
        editor.loadProjectData(editorData.projectData);

        console.log("Datos cargados correctamente desde Liveblocks");

        // Mostrar notificación de que se cargaron datos remotos
        setTimeout(() => {
          showToast("data-loaded");
        }, 1000);
      } catch (error) {
        console.error("Error al cargar datos desde Liveblocks:", error);

        // En caso de error, usar los datos por defecto pero notificar
        showToast("data-load-error");
      }
    } else {
      console.log(
        "No hay datos previos en Liveblocks, usando configuración por defecto"
      );
    }

    // Registrar componentes personalizados
    registerFlutterWidgets(editor);
    registerFlutterFormComponents(editor);

    setEditorReady(true);

    // Configurar eventos granulares para colaboración
    setupGranularEvents(editor);

    // Configurar eventos adicionales para indicadores visuales
    setupCollaborationIndicators(editor);
  };

  const setupCollaborationIndicators = (editor: Editor) => {
    // Mostrar cursores de otros usuarios
    editor.on("canvas:drop", (event) => {
      updateMyPresence({
        cursor: {
          x: event.clientX,
          y: event.clientY,
        },
      });
    });

    // Indicadores de componentes siendo editados por otros usuarios
    editor.on("component:selected", (component) => {
      updateMyPresence({
        selectedComponent: component?.getId() || null,
      });
    });
  };

  // Función de respaldo para sincronización completa (menos frecuente)
  const backupSync = () => {
    if (editor && !isApplyingRemoteChange) {
      console.log("Iniciando sincronización de respaldo...");
      try {
        const projectData = editor.getProjectData();
        syncEditorChanges({
          projectData,
          lastUpdated: Date.now(),
          lastEditor: userId,
        });
      } catch (error) {
        console.error("Error en sincronización de respaldo:", error);
      }
    }
  };

  // Sincronización de respaldo cada 30 segundos
  useEffect(() => {
    if (!editor) return;

    const interval = setInterval(backupSync, 30000);
    return () => clearInterval(interval);
  }, [editor, userId]);

  // Sincronizar cambios locales con LiveBlocks
  // useEffect(() => {
  //   if (!editor || !tempProjectData) return;
  //   console.log("Sincronizando cambios locales con LiveBlocks...");
  //   // Marcar que este cambio es local para evitar ciclos
  //   setIsLocalChange(true);

  //   // Enviar los cambios a LiveBlocks
  //   syncEditorChanges({
  //     projectData: tempProjectData,
  //     lastUpdated: Date.now(),
  //     lastEditor: userId,
  //   });
  // }, [tempProjectData, editor, syncEditorChanges, userId]);

  // Mostrar notificaciones
  const showToast = (id: string) => {
    const toastConfig = {
      "remote-update": {
        header: "Cambio remoto",
        content: "Un colaborador ha realizado cambios",
        variant: ToastVariant.Info,
      },
      "save-success": {
        header: "Guardado",
        content: "Cambios guardados correctamente",
        variant: ToastVariant.Success,
      },
      "collaboration-active": {
        header: "Colaboración activa",
        content: `${others.length} usuario(s) conectado(s)`,
        variant: ToastVariant.Success,
      },
    };

    const config = toastConfig[id as keyof typeof toastConfig] || {
      header: "Notificación",
      content: "Operación completada",
      variant: ToastVariant.Info,
    };

    editor?.runCommand(StudioCommands.toastAdd, {
      id,
      ...config,
    });
  };

  // Mostrar notificación cuando hay usuarios conectados
  useEffect(() => {
    if (others.length > 0) {
      showToast("collaboration-active");
    }
  }, [others.length]);

  // Función para guardar manualmente
  // const saveInstance = () => {
  //   if (editor && tempProjectData) {
  //     syncEditorChanges({
  //       projectData: tempProjectData,
  //       lastUpdated: Date.now(),
  //       lastEditor: userId,
  //     });
  //     showToast("save-success");
  //   }
  // };

  useEffect(() => {
    if (!editor || !editorReady || !editorData) return;

    console.log("Detectando cambio en editorData:", editorData);

    // Solo aplicar si es un cambio de otro usuario
    if (editorData.lastEditor && editorData.lastEditor !== userId) {
      console.log(`Aplicando cambio remoto de: ${editorData.lastEditor}`);

      try {
        // Guardar estado actual antes de recargar
        const currentPage = editor.Pages.getSelected();
        const currentPageId = currentPage?.getId();

        // Aplicar los cambios
        editor.loadProjectData(editorData.projectData);

        // Restaurar página después de cargar
        setTimeout(() => {
          if (currentPageId) {
            const pages = editor.Pages.getAll();
            const samePage = pages.find(
              (page) => page.getId() === currentPageId
            );
            if (samePage) {
              editor.Pages.select(samePage);
            }
          }
        }, 100);

        console.log("Cambio remoto aplicado correctamente");
        showToast("remote-update");
      } catch (error) {
        console.error("Error aplicando cambio remoto:", error);
      }
    }
  }, [editor, editorReady, editorData, userId]);

  return (
    <div className='flex h-screen flex-col'>
      <div className='flex gap-5 p-1'>
        <div className='font-bold'>Proyecto Colaborativo: {projectId}</div>
        {/* <button className='rounded border px-2' onClick={saveInstance}>
          Guardar
        </button> */}
        <button className='rounded border px-2' onClick={undo}>
          Deshacer
        </button>
        <button className='rounded border px-2' onClick={redo}>
          Rehacer
        </button>

        {/* Indicador de usuarios conectados */}
        {others.length > 0 && (
          <div className='flex items-center gap-2 rounded-full bg-green-100 px-3 py-1'>
            <div className='h-2 w-2 animate-pulse rounded-full bg-green-500'></div>
            <span className='text-sm text-green-700'>
              {others.length} colaborador{others.length !== 1 ? "es" : ""}{" "}
              activo{others.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      <div className='w-full flex-1 overflow-hidden'>
        <GrapesJsStudio
          onReady={onReady}
          onUpdate={(projectData: ProjectData, editor: Editor) => {}}
          options={{
            licenseKey:
              "af3d2b8444034aa7add74e53f516bef9a56b6d90974047198345feb229103393",
            project: {
              default: {
                pages: [
                  {
                    name: "Página Principal",
                    component: `<h1 style="padding: 2rem; text-align: center">
                      Proyecto Colaborativo ${projectId}
                    </h1>`,
                  },
                ],
              },
            },

            storage: {
              type: "self",
              autosaveChanges: 0,
            },

            pages: {
              settings: false,
            },

            plugins: [
              tableComponent.init({}),
              listPagesComponent.init({}),
              fsLightboxComponent.init({}),
              lightGalleryComponent.init({}),
              swiperComponent.init({}),
              iconifyComponent.init({}),
              accordionComponent.init({}),
              flexComponent.init({}),
              rteTinyMce.init({}),
              canvasGridMode.init({}),
              layoutSidebarButtons.init({}),
            ],
          }}
        />
      </div>
    </div>
  );
}
