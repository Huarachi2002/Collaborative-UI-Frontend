"use client";

import { ImportForm } from "@/components/import/ImportForm";
import { Button } from "@/components/ui/button";
import { importApi } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { fabric } from "fabric";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConversionProgress } from "@/components/import/ConversionProgress";
import { CustomFabricObject } from "@/types/type";
import { v4 as uuidv4 } from "uuid";

type ImportStatus = "idle" | "uploading" | "processing" | "completed" | "error";

// Tipo para el ProjectData de GrapesJS
interface GrapesJSProjectData {
  assets: any[];
  styles: Array<{
    selectors: string[];
    style: Record<string, any>;
  }>;
  pages: Array<{
    name: string;
    frames: Array<{
      component: any;
    }>;
  }>;
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [grapesJSProjectData, setGrapesJSProjectData] =
    useState<GrapesJSProjectData | null>(null);
  const [previewComponents, setPreviewComponents] = useState<any[]>([]);

  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const router = useRouter();

  // Agregar esta función para manejar la generación basada en prompt
  const handlePromptGeneration = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor ingresa una descripción de lo que deseas crear");
      return;
    }

    try {
      setIsGenerating(true);
      setProgress(10);

      console.log("Generando interfaz con prompt:", prompt);

      // Llamar a un nuevo endpoint de API
      const response = await importApi.generateFromPrompt(prompt);

      if (response.error) {
        throw new Error(response.error.message);
      }

      setProgress(80);

      console.log("GrapesJS ProjectData response:", response.data.data);

      // Recibir el ProjectData generado
      const projectData: GrapesJSProjectData = response.data.data;

      // Guardar y procesar el ProjectData
      setGrapesJSProjectData(projectData);
      const components = extractComponentsForPreview(projectData);
      setPreviewComponents(components);

      setProgress(100);
      setIsGenerating(false);
      setStatus("completed");

      toast.success("¡Interfaz generada exitosamente!");
    } catch (error) {
      console.error("Error generando interfaz:", error);
      setIsGenerating(false);
      toast.error(
        "Error al generar la interfaz: " +
          (error instanceof Error ? error.message : "Error desconocido")
      );
    }
  };

  // Función para manejar la selección de archivo
  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);

    // Crear URL para previsualización
    const fileUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(fileUrl);

    setStatus("idle");
    setProgress(0);

    setGrapesJSProjectData(null);
    setPreviewComponents([]);
  };

  // Función para procesar el boceto
  const handleProcessSketch = async () => {
    if (!file) return;

    try {
      setStatus("uploading");
      setProgress(10);

      const formData = new FormData();
      formData.append("sketch", file);

      // TODO: ImportApi
      const response = await importApi.processSketch(
        formData,
        (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(10 + percentCompleted * 0.4);
        }
      );

      if (response.error) {
        throw new Error(response.error.message);
      }

      setStatus("processing");
      setProgress(80);

      console.log(
        "GrapesJS ProjectData response:",
        response.data.data.elements
      );

      // Recibir directamente el ProjectData de GrapesJS
      const projectData: GrapesJSProjectData = response.data.data.elements;

      // Guardar el ProjectData
      setGrapesJSProjectData(projectData);
      setProgress(90);

      // Extraer componentes para preview
      const components = extractComponentsForPreview(projectData);
      setPreviewComponents(components);

      setProgress(100);
      setStatus("completed");
      toast.success("Boceto convertido a GrapesJS exitosamente!");
    } catch (error) {
      console.error("Error importing file:", error);
      setStatus("error");
      toast.error(
        "Error al importar el boceto: " +
          (error instanceof Error ? error.message : "Error desconocido")
      );
    }
  };

  // Ejemplos predefinidos de prompts
  const promptExamples = [
    "Crea una pantalla de login para una aplicación bancaria con campos de usuario y contraseña, un botón de iniciar sesión y opción para recuperar contraseña.",
    "Diseña un formulario de registro de pacientes para una clínica médica con campos para datos personales, historial médico e información de contacto.",
    "Genera un dashboard para una app de fitness con gráficas de progreso, lista de ejercicios y un contador de calorías.",
    "Crea una pantalla de perfil de usuario para una red social con foto, información del usuario y sección de publicaciones recientes.",
  ];

  // Función para cargar un ejemplo
  const loadExample = (example: string) => {
    setPrompt(example);
  };

  // Función para extraer componentes para mostrar en preview
  const extractComponentsForPreview = (
    projectData: GrapesJSProjectData
  ): any[] => {
    const components: any[] = [];

    projectData.pages.forEach((page) => {
      page.frames.forEach((frame) => {
        if (frame.component && frame.component.components) {
          components.push(...flattenComponents(frame.component.components));
        }
      });
    });

    return components;
  };

  // Función recursiva para aplanar componentes
  const flattenComponents = (components: any[]): any[] => {
    let flatComponents: any[] = [];

    components.forEach((component) => {
      flatComponents.push(component);
      if (component.components && component.components.length > 0) {
        flatComponents.push(...flattenComponents(component.components));
      }
    });

    return flatComponents;
  };

  const handleCreateProject = async () => {
    try {
      if (grapesJSProjectData) {
        console.log("Objetos a importar:", grapesJSProjectData);
        localStorage.setItem(
          "importedSketchObjects",
          JSON.stringify(grapesJSProjectData)
        );

        router.push(APP_ROUTES.DASHBOARD.CREATE_PROJECT);
        toast.success("Objetos importados listos para el nuevo proyecto");
      } else {
        toast.error("No hay objetos para crear el proyecto.");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error(
        "Error al crear el proyecto :" +
          (error instanceof Error ? error.message : "Error desconocido")
      );
    }
  };

  // Función para renderizar preview de componente
  const renderComponentPreview = (component: any, index: number) => {
    const getComponentIcon = (type: string) => {
      switch (type) {
        case "flutter-appbar":
          return "📱";
        case "flutter-card":
          return "🃏";
        case "flutter-textfield":
          return "📝";
        case "flutter-button":
        case "button":
          return "🔘";
        case "text":
          return "📄";
        case "image":
          return "🖼️";
        case "flutter-container":
        case "div":
          return "📦";
        default:
          return "🔧";
      }
    };

    const getComponentName = (type: string) => {
      switch (type) {
        case "flutter-appbar":
          return "App Bar";
        case "flutter-card":
          return "Card";
        case "flutter-textfield":
          return "Text Field";
        case "flutter-button":
          return "Flutter Button";
        case "button":
          return "Button";
        case "text":
          return "Text";
        case "image":
          return "Image";
        case "flutter-container":
          return "Flutter Container";
        case "div":
          return "Container";
        default:
          return type || "Component";
      }
    };

    return (
      <div
        key={index}
        className='flex items-center gap-3 rounded-lg border bg-white p-3 hover:bg-gray-50'
      >
        <span className='text-2xl'>{getComponentIcon(component.type)}</span>
        <div className='flex-1'>
          <div className='text-sm font-medium'>
            {getComponentName(component.type)}
          </div>
          {component.content && (
            <div className='truncate text-xs text-gray-500'>
              {component.content.replace(/<[^>]*>/g, "").substring(0, 50)}...
            </div>
          )}
          {component.attributes?.class && (
            <div className='text-xs text-blue-600'>
              .{component.attributes.class}
            </div>
          )}
        </div>
        <div className='text-xs text-gray-400'>
          #{component.attributes?.id || "no-id"}
        </div>
      </div>
    );
  };

  return (
    <div className='container py-8'>
      <h1 className='mb-6 text-3xl font-bold'>Importar Proyecto</h1>

      <Tabs defaultValue='upload' className='w-full'>
        <TabsList className='mb-8 grid w-full grid-cols-2'>
          <TabsTrigger value='upload'>Subir Boceto</TabsTrigger>
          <TabsTrigger
            value='about'
            disabled={status === "uploading" || status === "processing"}
          >
            Realizar un Prompt
          </TabsTrigger>
        </TabsList>

        <TabsContent value='upload'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Subir Boceto</CardTitle>
                  <CardDescription>
                    Sube una imagen de tu boceto para convertirlo en un proyecto
                    editable
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImportForm onFileChange={handleFileChange} />

                  {(status === "uploading" || status === "processing") && (
                    <div className='mt-6'>
                      <ConversionProgress status={status} progress={progress} />
                    </div>
                  )}

                  {/* {previewUrl && status === "idle" && ( */}
                  {previewUrl && (
                    <div className='mt-4'>
                      <h3 className='mb-2 text-lg font-medium'>
                        Vista previa de la imagen
                      </h3>
                      <div className='overflow-hidden rounded-lg border'>
                        <img
                          src={previewUrl}
                          alt='Vista previa del boceto'
                          className='h-auto w-full'
                        />
                      </div>
                      {status === "idle" && (
                        <Button
                          onClick={handleProcessSketch}
                          className='mt-4 w-full bg-blue-400 text-white hover:bg-blue-500'
                        >
                          Procesar Boceto
                        </Button>
                      )}
                    </div>
                  )}

                  {status === "error" && (
                    <div className='mt-4 rounded-md border border-red-200 bg-red-50 p-4'>
                      <h3 className='mb-2 text-lg font-medium text-red-600'>
                        Error
                      </h3>
                      <p className='text-red-500'>
                        Ocurrió un error al procesar el boceto. Por favor,
                        intenta con otra imagen.
                      </p>
                      <Button
                        variant='outline'
                        onClick={() => setStatus("idle")}
                        className='mt-2'
                      >
                        Volver a Intentar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Resultado</CardTitle>
                  <CardDescription>
                    {status === "completed"
                      ? "Boceto procesado y convertido a objetos editables"
                      : "Aquí aparecerá el resultado procesado"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='max-h-96 overflow-y-auto'>
                    {status === "completed" && previewComponents.length > 0 ? (
                      <div className='space-y-2'>
                        {previewComponents.map((component, index) =>
                          renderComponentPreview(component, index)
                        )}
                      </div>
                    ) : (
                      <div className='flex h-32 items-center justify-center text-gray-500'>
                        {status === "processing"
                          ? "Procesando componentes..."
                          : "Sube un boceto para comenzar"}
                      </div>
                    )}
                  </div>

                  {/* Información del proyecto */}
                  {grapesJSProjectData && (
                    <div className='mt-4 rounded-lg bg-blue-50 p-3'>
                      <h4 className='mb-2 font-medium text-blue-900'>
                        Información del Proyecto:
                      </h4>
                      <div className='space-y-1 text-sm text-blue-700'>
                        <div>
                          📄 Páginas: {grapesJSProjectData.pages.length}
                        </div>
                        <div>
                          🎨 Estilos: {grapesJSProjectData.styles.length}
                        </div>
                        <div>
                          📁 Assets: {grapesJSProjectData.assets.length}
                        </div>
                        <div>🧩 Componentes: {previewComponents.length}</div>
                      </div>
                    </div>
                  )}
                </CardContent>

                {status === "completed" && grapesJSProjectData && (
                  <CardFooter className='flex justify-between'>
                    <Button
                      onClick={handleProcessSketch}
                      variant='outline'
                      className='w-max'
                    >
                      🔄 Reimaginar boceto
                    </Button>
                    <Button
                      onClick={handleCreateProject}
                      className='w-max bg-green-500 text-white hover:bg-green-600'
                    >
                      ✨ Crear Proyecto GrapesJS
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='about'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Generar UI con Instrucciones</CardTitle>
                  <CardDescription>
                    Describe la interfaz que necesitas y nuestro sistema la
                    generará automáticamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-6'>
                    {/* Área de texto para el prompt */}
                    <div>
                      <label
                        htmlFor='prompt'
                        className='mb-2 block text-sm font-medium'
                      >
                        Describe lo que necesitas crear:
                      </label>
                      <textarea
                        id='prompt'
                        rows={6}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                        placeholder='Por ejemplo: Crea una pantalla de login para una aplicación bancaria con campos de usuario y contraseña...'
                        disabled={isGenerating}
                      />
                    </div>

                    {/* Ejemplos sugeridos */}
                    <div>
                      <h3 className='mb-2 text-sm font-medium'>Ejemplos:</h3>
                      <div className='grid gap-2'>
                        {promptExamples.map((example, index) => (
                          <button
                            key={index}
                            onClick={() => loadExample(example)}
                            className='rounded-md border border-border p-2 text-left text-sm text-blue-600 hover:bg-muted hover:text-blue-800'
                            disabled={isGenerating}
                          >
                            {example.substring(0, 80)}...
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Consejos para mejores resultados */}
                    <div>
                      <h3 className='mb-2 text-sm font-medium'>
                        Consejos para mejores resultados:
                      </h3>
                      <ul className='list-inside list-disc space-y-1 text-sm text-gray-600'>
                        <li>
                          Sé específico sobre el tipo de aplicación (bancaria,
                          médica, social, etc.)
                        </li>
                        <li>
                          Menciona los componentes principales que necesitas
                        </li>
                        <li>Incluye detalles sobre el estilo visual deseado</li>
                        <li>
                          Especifica si necesitas funcionalidad para
                          dispositivos móviles
                        </li>
                      </ul>
                    </div>

                    {/* Barra de progreso */}
                    {isGenerating && (
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between text-sm'>
                          <span>Generando interfaz...</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className='h-2 w-full overflow-hidden rounded-full bg-gray-100'>
                          <div
                            className='h-full bg-blue-500 transition-all duration-300'
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className='animate-pulse text-xs text-gray-500'>
                          Analizando instrucciones y creando componentes
                          Flutter...
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handlePromptGeneration}
                    disabled={isGenerating || !prompt.trim()}
                    className='w-full bg-blue-500 text-white hover:bg-blue-600'
                  >
                    {isGenerating ? (
                      <>
                        <span className='animate-spin'>🔄</span> Generando...
                      </>
                    ) : (
                      "Generar Interfaz"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Resultado</CardTitle>
                  <CardDescription>
                    {status === "completed"
                      ? "Interfaz generada a partir de tus instrucciones"
                      : "Aquí aparecerá el resultado de la generación"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='max-h-96 overflow-y-auto'>
                    {status === "completed" && previewComponents.length > 0 ? (
                      <div className='space-y-2'>
                        {previewComponents.map((component, index) =>
                          renderComponentPreview(component, index)
                        )}
                      </div>
                    ) : (
                      <div className='flex h-32 items-center justify-center text-gray-500'>
                        {status === "processing"
                          ? "Generando componentes..."
                          : "Describe lo que necesitas crear para generar la interfaz"}
                      </div>
                    )}
                  </div>

                  {/* Información del proyecto */}
                  {grapesJSProjectData && (
                    <div className='mt-4 rounded-lg bg-blue-50 p-3'>
                      <h4 className='mb-2 font-medium text-blue-900'>
                        Informacion del Proyecto:
                      </h4>
                      <div className='space-y-1 text-sm text-blue-700'>
                        <div>
                          📄 Páginas: {grapesJSProjectData.pages.length}
                        </div>
                        <div>
                          🎨 Estilos: {grapesJSProjectData.styles.length}
                        </div>
                        <div>
                          📁 Assets: {grapesJSProjectData.assets.length}
                        </div>
                        <div>🧩 Componentes: {previewComponents.length}</div>
                      </div>
                    </div>
                  )}
                </CardContent>

                {status === "completed" && grapesJSProjectData && (
                  <CardFooter className='flex justify-between'>
                    <Button
                      onClick={handlePromptGeneration}
                      variant='outline'
                      className='w-max'
                    >
                      🔄 Reimaginar interfaz
                    </Button>
                    <Button
                      onClick={handleCreateProject}
                      className='w-max bg-green-500 text-white hover:bg-green-600'
                    >
                      ✨ Crear Proyecto GrapesJS
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
