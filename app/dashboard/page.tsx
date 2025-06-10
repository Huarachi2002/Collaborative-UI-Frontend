"use client";

import DeleteProjectModal from "@/components/projects/DeleteProjectModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { projectsApi, usersApi } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import { Project } from "@/types/type";
import {
  ArrowRightCircle,
  Clock,
  CopyCheckIcon,
  EditIcon,
  HelpCircle,
  Plus,
  Trash2Icon,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [project, setProject] = useState<Project>({
    id: 0,
    idRoom: "",
    name: "",
    description: "",
    code: "",
    createdAt: "",
    activeUserCount: 0,
    maxMembers: 0,
    createdBy: "",
  });
  const [invitedProjects, setInvitedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedProjects, setCopiedProjects] = useState<Record<string, boolean>>(
    {}
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Enlaces de ayuda para el menú desplegable
  const helpLinks = [
    {
      title: "Autenticacion",
      url: "https://drive.google.com/file/d/1p_sl-Ckxlg0ZGCC6llWrQRuM6hKPT_nn/view?usp=sharing",
    },
    {
      title: "Gestionar Salas (Crear)",
      url: "https://drive.google.com/file/d/1_i7SHBBkfkf11XGrmka6QpUSGy5_tyqj/view?usp=sharing",
    },
    {
      title: "Gestionar Salas (Editar)",
      url: "https://drive.google.com/file/d/1uSDJ4K2KScohwJjxdCVAqmFRbxgsGmAB/view?usp=sharing",
    },
    {
      title: "Gestionar Salas (Eliminar)",
      url: "https://drive.google.com/file/d/1Ojrela54EON7RJzq5twaND_3VDj1DKWf/view?usp=sharing",
    },
    {
      title: "Gestionar Cuenta de Usuario",
      url: "https://drive.google.com/file/d/1UfRogZ_efs6YC8qrdfdQRCZ_up2_LFLV/view?usp=sharing",
    },
    {
      title: "Unirse a una Sala",
      url: "https://drive.google.com/file/d/1DOCKWaTnWx9q3cZkXo5pcubllUmvSH5A/view?usp=sharing",
    },
    {
      title: "Diseñar Canvas",
      url: "https://drive.google.com/file/d/1-7WAUfgbe1XHFWap4lRVMVj4A0bmMrhS/view?usp=sharing",
    },
    {
      title: "Importar Boceto",
      url: "https://drive.google.com/file/d/1xBmoAlhykViNJneETxrfcDdTMNxW3wQI/view?usp=sharing",
    },
    {
      title: "Exportar Proyecto Angular",
      url: "https://drive.google.com/file/d/1f5LvX4gVMKhU51h5WRoeAD3vH02lxML0/view?usp=sharing",
    },
  ];

  const handleDeleteProject = async () => {
    try {
      // Eliminar el proyecto del almacenamiento local
      // TODO En producción: DELETE /api/projects/{projectId}
      const responseProjects = await projectsApi.delete(project.id);
      console.log("Response:", responseProjects);
      if (responseProjects.error) {
        console.error(
          "Error al eliminar el proyecto:",
          responseProjects.error.message
        );
        return;
      }

      const updatedProjects = projects.filter(
        (p: Project) => p.idRoom !== project?.idRoom
      );

      setProjects(updatedProjects);

      setIsDeleteModalOpen(false);

      // No es necesario un return explícito, pero puedes añadirlo para mayor claridad
      return;
    } catch (error) {
      console.error("Error al eliminar el proyecto:", error);
      throw new Error("No se pudo eliminar el proyecto");
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // TODO: Aquí se realizaría una llamada a la API para obtener los proyectos
        // GET: /api/projects
        const response = await usersApi.getCreateProjects(user!.id);

        console.log("Response:", response);
        if (response.error) {
          console.error("Error al cargar proyectos:", response.error.message);
          return;
        }

        const projects = response.data.data.rooms;
        console.log("Proyectos:", projects);
        setProjects(projects);

        // GET: /api/projects/invited
        const responseInvited = await usersApi.getInvitedProjects(user!.id);

        console.log("Response Invited:", responseInvited);
        if (responseInvited.error) {
          console.error(
            "Error al cargar proyectos invitados:",
            responseInvited.error.message
          );
          return;
        }

        setInvitedProjects(responseInvited.data.data.rooms);
      } catch (error) {
        console.error("Error al cargar proyectos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.email) {
      fetchProjects();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const renderProjectsList = (projectsList: Project[], isInvited = false) => {
    if (projectsList.length === 0) {
      return (
        <div className='rounded-lg border-2 border-dashed border-gray-300 p-6 text-center'>
          <h3 className='mt-2 text-sm font-medium text-gray-500'>
            {isInvited
              ? "No has sido invitado a ningún proyecto aún."
              : "No tienes proyectos creados aún."}
          </h3>
        </div>
      );
    }

    return (
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {projectsList.map((project) => (
          <div
            key={project.idRoom}
            className='group rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-md'
          >
            <h2 className='text-lg font-medium text-gray-900'>
              {project.name}
            </h2>
            {project.description && (
              <p className='mt-1 line-clamp-2 text-sm text-gray-600'>
                {project.description}
              </p>
            )}
            <div className='mt-4 flex items-center text-sm text-gray-500'>
              <Clock className='mr-1 h-4 w-4' />
              {new Date(project.createdAt).toLocaleDateString()}
            </div>
            <div className='mt-2 flex items-center text-sm text-gray-500'>
              <User className='mr-1 h-4 w-4' />
              {/* {project.collaborators.length + 1} de {project.maxMembers}{" "} */}
              {project.activeUserCount} de {project.maxMembers} miembros
            </div>
            <div className='mt-2 flex justify-items-start gap-2 text-sm text-gray-500'>
              Código:{" "}
              <span className='font-mono font-medium'>{project.code}</span>
              {copiedProjects[project.idRoom] ? (
                <span className='text-xs text-green-600'>¡Copiado!</span>
              ) : (
                <CopyCheckIcon
                  className='h-4 w-4 cursor-pointer text-gray-500 transition-colors duration-200 ease-in-out hover:text-primary-blue'
                  onClick={() => {
                    navigator.clipboard.writeText(project.code).then(() => {
                      setCopiedProjects((prev) => ({
                        ...prev,
                        [project.idRoom]: true,
                      }));
                      setTimeout(() => {
                        setCopiedProjects((prev) => ({
                          ...prev,
                          [project.idRoom]: false,
                        }));
                      }, 2000);
                    });
                  }}
                />
              )}
            </div>
            <div className='mt-2 flex items-center'>
              {!isInvited && (
                <>
                  <Link
                    href={APP_ROUTES.DASHBOARD.PROJECT.EDIT(
                      project.id.toString()
                    )}
                    className='mt-4 flex items-center text-sm text-yellow-400 opacity-0 transition-opacity group-hover:opacity-100'
                  >
                    <EditIcon className='mr-1 h-4 w-4' />
                    Editar
                  </Link>
                  <Button
                    onClick={() => {
                      setIsDeleteModalOpen(true);
                      setProject(project);
                    }}
                    className='mt-4 flex items-center text-sm text-red-400 opacity-0 transition-opacity group-hover:opacity-100'
                  >
                    <Trash2Icon className='mr-1 h-4 w-4' />
                    Eliminar
                  </Button>
                </>
              )}

              <Link
                className='mt-4 flex items-center text-sm text-primary-blue opacity-0 transition-opacity group-hover:opacity-100'
                href={APP_ROUTES.DASHBOARD.PROJECT.ROOT(project.idRoom)}
              >
                <span>Unirte</span>
                <ArrowRightCircle className='ml-1 h-4 w-4' />
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='mx-auto max-w-7xl px-4 sm:px-6 md:px-8'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold text-gray-900'>Mis Proyectos</h1>
        <div className='mt-3 flex space-x-3'>
          <Link
            href={APP_ROUTES.DASHBOARD.JOIN_PROJECT}
            className='inline-flex items-center rounded-md border border-primary-blue px-4 py-2 text-sm font-medium text-primary-blue shadow-sm hover:bg-blue-50'
          >
            <ArrowRightCircle className='mr-2 h-4 w-4' />
            Unirse con código
          </Link>
          <Link
            href={APP_ROUTES.DASHBOARD.CREATE_PROJECT}
            className='inline-flex items-center rounded-md border border-transparent bg-primary-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700'
          >
            <Plus className='mr-2 h-4 w-4' />
            Crear Proyecto
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='ml-2'>
                <HelpCircle className='mr-2 h-4 w-4' />
                Ayuda
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {helpLinks.map((link, index) => (
                <DropdownMenuItem key={index} asChild>
                  <Link
                    href={link.url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {link.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='mt-8'>
        {isLoading ? (
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='animate-pulse rounded-lg border border-gray-200 bg-white p-6'
              >
                <div className='h-4 w-3/4 rounded bg-gray-200'></div>
                <div className='mt-4 h-3 w-1/2 rounded bg-gray-200'></div>
                <div className='mt-6 h-3 w-1/3 rounded bg-gray-200'></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className='mt-8'>
              <h2 className='mb-4 text-xl font-medium'>
                Mis proyectos creados
              </h2>
              {renderProjectsList(projects)}
            </div>

            {invitedProjects.length > 0 && (
              <div className='mt-12'>
                <h2 className='mb-4 text-xl font-medium'>
                  Proyectos donde estoy invitado
                </h2>
                {renderProjectsList(invitedProjects, true)}
              </div>
            )}
          </>
        )}
      </div>
      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        projectTitle={project.name}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleDeleteProject}
      />
    </div>
  );
}
