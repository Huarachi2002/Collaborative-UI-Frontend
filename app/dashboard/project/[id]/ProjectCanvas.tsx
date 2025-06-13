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
import { Button } from "@/components/ui/button";
import { registerFlutterWidgets } from "@/components/projects/flutter-widgets";
import { registerFlutterFormComponents } from "@/components/projects/flutter-forms";
import { useGrapesJSCollaboration } from "@/hooks/useGrapesJSCollaboration";
import { exportApi } from "@/lib/api";
import { Download } from "lucide-react";

interface EditorState {
  projectData: ProjectData;
  lastUpdated: number;
  lastEditor: string;
}

export default function ProjectCanvas() {
  const params = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  // Estado para el editor
  const [editor, setEditor] = useState<Editor>();
  const [editorReady, setEditorReady] = useState(false);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);

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

  // Añade esta función en el componente, junto con las demás funciones
  const handleExportToFlutter = async () => {
    if (!editor) {
      showToast("export-error");
      return;
    }

    try {
      setIsExporting(true);

      // Obtener los datos del proyecto
      const grapesJsData = editor.getProjectData();

      // Preparar los datos para enviar
      const exportData = {
        projectName: `flutter-project-${projectId}`,
        grapesJsData,
      };

      console.log("Exportando proyecto a Flutter:", exportData);

      // Llamar a la API de exportación
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL + "/export/flutter";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error del servidor:", response.status, errorText);
        throw new Error(
          `Error en la respuesta del servidor: ${response.status} - ${errorText}`
        );
      }

      // Obtener la respuesta como blob (archivo binario ZIP)
      const blobData = await response.blob();

      // Crear URL para descarga
      const url = window.URL.createObjectURL(
        new Blob([blobData], { type: "application/zip" })
      );

      // Crear y activar enlace de descarga
      const a = document.createElement("a");
      a.href = url;
      a.download = `flutter-project-${projectId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Liberar URL
      window.URL.revokeObjectURL(url);

      // Guardar la URL temporal para mostrar banner opcional
      setExportUrl(url);

      showToast("export-success");
    } catch (error) {
      console.error("Error exportando a Flutter:", error);
      showToast("export-error");
    } finally {
      setIsExporting(false);
    }
  };

  // Función que se ejecuta cuando el editor está listo
  const onReady = (editor: Editor) => {
    console.log("Editor GrapesJS cargado correctamente", editor);
    setEditor(editor);

    const editorDataImport = localStorage.getItem("importedSketchObjects");
    console.log("Datos importados desde localStorage:", editorDataImport);
    if (editorDataImport) {
      const page = editor.Pages.getSelected();
      if (page) {
        try {
          const projectData = JSON.parse(editorDataImport) as ProjectData;
          // Cargar datos importados desde localStorage
          console.log("Cargando datos importados:", editorDataImport);

          // Cargar el proyecto completo desde los datos importados
          editor.loadProjectData(projectData);

          console.log("Datos importados cargados correctamente");
          const dataJsonProject = editor.getProjectData();
          console.log(
            "Datos del proyecto importado:",
            JSON.stringify(dataJsonProject)
          );

          syncEditorChanges({
            projectData: editor.getProjectData(),
            lastUpdated: Date.now(),
            lastEditor: userId,
          });

          localStorage.removeItem("importedSketchObjects");

          // Mostrar notificación de que se cargaron datos importados
          setTimeout(() => {
            showToast("data-imported");
          }, 500);
        } catch (error) {
          console.error("Error al cargar datos importados:", error);
          showToast("import-structure-error");
        }
      }
    } else if (editorData && editorData.projectData) {
      try {
        console.log(
          "Cargando datos existentes desde Liveblocks...",
          editorData
        );

        // Cargar el proyecto completo desde Liveblocks
        editor.loadProjectData(editorData.projectData);

        const page = editor.Pages.getSelected();
        console.log("Página seleccionada:", page);
        if (page) {
          console.log("Restaurando componentes de la página...");
          // Restaurar la página seleccionada después de cargar
          const currentPage = page.getMainComponent();
          currentPage.components().reset();
          console.log("Componentes de la página restaurados");
          currentPage.components(editorData.projectData.components);
          const dataJsonProject = editor.getProjectData();
          console.log(
            "Datos del proyecto importado:",
            JSON.stringify(dataJsonProject)
          );
        }
        console.log("Datos cargados correctamente desde Liveblocks");
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

    const interval = setInterval(backupSync, 2000);
    return () => clearInterval(interval);
  }, [editor, userId]);

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
      "export-success": {
        header: "Exportación exitosa",
        content: "El proyecto se ha exportado a Flutter correctamente",
        variant: ToastVariant.Success,
      },
      "export-error": {
        header: "Error de exportación",
        content: "No se pudo exportar el proyecto a Flutter",
        variant: ToastVariant.Error,
      },
      "data-imported": {
        header: "Importación exitosa",
        content: "Los datos se han importado correctamente",
        variant: ToastVariant.Success,
      },
      "import-structure-error": {
        header: "Error de estructura",
        content: "La estructura de los datos importados no es válida",
        variant: ToastVariant.Error,
      },
      "data-loaded": {
        header: "Datos cargados",
        content: "Los datos se han cargado desde Liveblocks",
        variant: ToastVariant.Success,
      },
      "data-load-error": {
        header: "Error de carga",
        content: "No se pudieron cargar los datos desde Liveblocks",
        variant: ToastVariant.Error,
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

  useEffect(() => {
    console.log("Editor data actualizado:", editorData);
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

  useEffect(() => {
    // Limpiar cualquier dato previo de GrapesJS en localStorage
    const clearGrapesJSStorage = () => {
      try {
        // Eliminar específicamente el proyecto de GrapesJS
        localStorage.removeItem("gjsProject");

        // También limpiar otras claves relacionadas si existen
        const keysToRemove = [
          "gjsProject",
          "gjs-", // Prefijo común de GrapesJS
          "grapes-", // Otro prefijo posible
        ];

        // Buscar y eliminar todas las claves que coincidan
        Object.keys(localStorage).forEach((key) => {
          keysToRemove.forEach((prefix) => {
            if (key.startsWith(prefix) || key === "gjsProject") {
              localStorage.removeItem(key);
              console.log(`Removed localStorage key: ${key}`);
            }
          });
        });

        console.log("GrapesJS localStorage limpiado");
      } catch (error) {
        console.error("Error limpiando localStorage:", error);
      }
    };

    // Ejecutar la limpieza
    clearGrapesJSStorage();
  }, []); // Solo se ejecuta una vez al montar

  return (
    <div className='flex h-screen flex-col'>
      <div className='flex gap-5 p-1'>
        <div className='font-bold'>Proyecto Colaborativo: {projectId}</div>
        {/* <button className='rounded border px-2' onClick={saveInstance}>
          Guardar
        </button> */}

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

        {/* Botón de exportación */}
        <Button
          onClick={handleExportToFlutter}
          disabled={isExporting || !editor}
          className='flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700'
          size='sm'
        >
          {isExporting ? (
            <>
              <div className='h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
              <span>Exportando...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Exportar a Flutter</span>
            </>
          )}
        </Button>
      </div>

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
            type: "self", // o null
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
  );
}
