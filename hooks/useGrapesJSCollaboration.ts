import {
  useBroadcastEvent,
  useEventListener,
  useMutation,
  useMyPresence,
  useStorage,
} from "@/liveblocks.config";
import { Editor } from "grapesjs";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef } from "react";

import type { ComponentOperation, StyleOperation } from "@/liveblocks.config";

export const useGrapesJSCollaboration = (
  editor: Editor | undefined,
  userId: string
) => {
  const isApplyingRemoteChange = useRef(false);
  const [, updateMyPresence] = useMyPresence();
  const broadcast = useBroadcastEvent();

  // Mutaciones para operaciones granulares
  const addComponentOperation = useMutation(
    ({ storage }, operation: ComponentOperation) => {
      try {
        // Verificar si existe la lista de operaciones, crearla si no existe
        let operations = storage.get("operations");
        if (!operations) {
          storage.set("operations", []);
          operations = storage.get("operations");
        }

        operations.push(operation);

        // Mantener solo las últimas 100 operaciones
        if (operations.length > 100) {
          operations.delete(0);
        }
      } catch (error) {
        console.error("Error adding component operation:", error);
      }
    },
    []
  );

  const addStyleOperation = useMutation(
    ({ storage }, operation: StyleOperation) => {
      try {
        let operations = storage.get("operations");
        if (!operations) {
          storage.set("operations", []);
          operations = storage.get("operations");
        }

        operations.push(operation);

        if (operations.length > 100) {
          operations.delete(0);
        }
      } catch (error) {
        console.error("Error adding style operation:", error);
      }
    },
    []
  );

  const updateComponent = useMutation(
    ({ storage }, { id, data }: { id: string; data: any }) => {
      try {
        // Verificar si existe el mapa de componentes
        let components = storage.get("components");
        if (!components) {
          storage.set("components", new Map<String, any>());
          components = storage.get("components");
        }

        components.set(id, data);
      } catch (error) {
        console.error("Error updating component:", error);
      }
    },
    []
  );

  const updateStyle = useMutation(
    ({ storage }, { selector, styles }: { selector: string; styles: any }) => {
      try {
        let stylesMap = storage.get("styles");
        if (!stylesMap) {
          storage.set("styles", new Map<String, any>());
          stylesMap = storage.get("styles");
        }

        stylesMap.set(selector, styles);
      } catch (error) {
        console.error("Error updating style:", error);
      }
    },
    []
  );

  // Configurar eventos del editor para operaciones granulares
  const setupGranularEvents = useCallback(
    (editor: Editor) => {
      console.log("Setting up granular events for editor:", editor);
      if (!editor) return;
      console.log("Editor is defined, setting up events...");
      let debounceTimer: NodeJS.Timeout;
      const debouncedSync = (
        operation: ComponentOperation | StyleOperation
      ) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (!isApplyingRemoteChange.current) {
            if ("componentId" in operation) {
              addComponentOperation(operation);
            } else {
              addStyleOperation(operation);
            }
          }
        }, 150); // Debounce más corto para mejor responsividad
      };

      // Eventos de componentes
      editor.on("component:add", (component) => {
        console.log("Component added:", component);
        const operation: ComponentOperation = {
          id: nanoid(),
          type: "add",
          componentId: component.getId(),
          data: {
            type: component.get("type"),
            tagName: component.get("tagName"),
            attributes: component.getAttributes(),
            classes: component.getClasses(),
            content: component.get("content"),
            parent: component.parent()?.getId(),
            index: component.index(),
          },
          timestamp: Date.now(),
          userId,
        };

        debouncedSync(operation);

        // Actualizar también el mapa de componentes
        updateComponent({
          id: component.getId(),
          data: operation.data,
        });
      });

      editor.on("component:remove", (component) => {
        console.log("Component removed:", component);
        try {
          const operation: ComponentOperation = {
            id: nanoid(),
            type: "remove",
            componentId: component.getId(),
            timestamp: Date.now(),
            userId,
          };

          debouncedSync(operation);
        } catch (error) {
          console.error("Error in component:remove event:", error);
        }
      });

      editor.on("component:update", (component, options) => {
        console.log("Component updated:", component, options);
        try {
          const operation: ComponentOperation = {
            id: nanoid(),
            type: "update",
            componentId: component.getId(),
            data: {
              changed: options?.changed, // component.changed.open,
              attributes: component.getAttributes(),
              classes: component.getClasses(),
              content: component.get("content"),
            },
            timestamp: Date.now(),
            userId,
          };

          debouncedSync(operation);

          updateComponent({
            id: component.getId(),
            data: operation.data,
          });
        } catch (error) {
          console.error("Error in component:update event:", error);
        }
      });

      // Eventos de estilos
      editor.on("rule:add", (rule) => {
        console.log("Rule added:", rule);
        try {
          const operation: StyleOperation = {
            id: nanoid(),
            type: "add",
            selectorText: rule.selectorsToString(),
            value: rule.getDeclaration(),
            timestamp: Date.now(),
            userId,
          };

          debouncedSync(operation);

          updateStyle({
            selector: rule.selectorsToString(),
            styles: rule.getDeclaration(),
          });
        } catch (error) {
          console.error("Error in rule:add event:", error);
        }
      });

      editor.on("rule:update", (rule) => {
        console.log("Rule updated:", rule);
        try {
          const operation: StyleOperation = {
            id: nanoid(),
            type: "update",
            selectorText: rule.selectorsToString(),
            value: rule.getDeclaration(),
            timestamp: Date.now(),
            userId,
          };

          debouncedSync(operation);

          updateStyle({
            selector: rule.selectorsToString(),
            styles: rule.getDeclaration(),
          });
        } catch (error) {
          console.error("Error in rule:update event:", error);
        }
      });

      // Evento de selección para presencia en tiempo real
      editor.on("component:selected", (component) => {
        console.log("Component selected:", component);
        try {
          updateMyPresence({
            selectedComponent: component?.getId() || null,
          });

          broadcast({
            type: "component-selected",
            data: { componentId: component?.getId(), userId },
          });
        } catch (error) {
          console.error("Error in component:selected event:", error);
        }
      });
    },
    [
      addComponentOperation,
      addStyleOperation,
      updateComponent,
      updateStyle,
      userId,
      updateMyPresence,
      broadcast,
    ]
  );

  // Aplicar operaciones remotas
  const operations = useStorage((root) => {
    try {
      return root.operations || [];
    } catch (error) {
      console.error("Error accessing operations from storage:", error);
      return [];
    }
  });

  const lastProcessedIndex = useRef(0);

  useEffect(() => {
    if (!editor || !operations) return;

    // Procesar solo las nuevas operaciones
    const newOperations = operations.slice(lastProcessedIndex.current);

    if (newOperations.length > 0) {
      isApplyingRemoteChange.current = true;

      newOperations.forEach((operation) => {
        if (operation.userId === userId) return; // Ignorar nuestras propias operaciones

        try {
          if ("componentId" in operation) {
            applyComponentOperation(editor, operation);
          } else {
            applyStyleOperation(editor, operation);
          }
        } catch (error) {
          console.error("Error aplicando operación remota:", error);
        }
      });

      lastProcessedIndex.current = operations.length;

      // Pequeño delay para evitar conflictos
      setTimeout(() => {
        isApplyingRemoteChange.current = false;
      }, 100);
    }
  }, [operations, editor, userId]);

  // Funciones para aplicar operaciones remotas
  const applyComponentOperation = (
    editor: Editor,
    operation: ComponentOperation
  ) => {
    const { type, componentId, data } = operation;

    switch (type) {
      case "add":
        console.log("Adding component:", data);
        if (!editor.DomComponents.getById(componentId)) {
          const parentId = data.parent;
          const parent = parentId
            ? editor.DomComponents.getById(parentId)
            : editor.DomComponents.getWrapper();

          if (parent) {
            parent.append(
              {
                type: data.type,
                tagName: data.tagName,
                attributes: data.attributes,
                classes: data.classes,
                content: data.content,
              },
              { at: data.index }
            );
          }
        }
        break;

      case "remove":
        console.log("Removing component:", componentId);
        const componentToRemove = editor.DomComponents.getById(componentId);
        if (componentToRemove) {
          componentToRemove.remove();
        }
        break;

      case "update":
        console.log("Updating component:", componentId, data);
        const componentToUpdate = editor.DomComponents.getById(componentId);
        if (componentToUpdate) {
          if (data.attributes) {
            componentToUpdate.setAttributes(data.attributes);
          }
          if (data.classes) {
            componentToUpdate.setClass(data.classes);
          }
          if (data.content !== undefined) {
            componentToUpdate.set("content", data.content);
          }
        }
        break;
    }
  };

  const applyStyleOperation = (editor: Editor, operation: StyleOperation) => {
    const { type, selectorText, value } = operation;

    try {
      console.log(
        `Applying style operation: ${type} for selector: ${selectorText}`,
        operation
      );

      switch (type) {
        case "add":
          console.log("Adding style rule:", selectorText, value);
          const css = editor.CssComposer;

          // Verificar si la regla ya existe
          let existingRule = css.getRule(selectorText);
          if (!existingRule) {
            // Crear nueva regla si no existe
            existingRule = css.add(selectorText);
          }

          if (existingRule && value) {
            existingRule.setStyle(value);
            console.log("Style rule added successfully");
          }
          break;

        case "update":
          console.log("Updating style rule:", selectorText, value);
          const cssComposer = editor.CssComposer;
          const rule =
            cssComposer.getRule(selectorText) || cssComposer.add(selectorText);

          if (rule && value) {
            rule.setStyle(value);
            console.log("Style rule updated successfully");
          } else {
            console.warn(
              "Could not find or create rule for selector:",
              selectorText
            );
          }
          break;

        case "remove":
          console.log("Removing style rule:", selectorText);
          const ruleToRemove = editor.CssComposer.getRule(selectorText);

          if (ruleToRemove) {
            ruleToRemove.remove();
            console.log("Style rule removed successfully");
          } else {
            console.warn("Rule not found for removal:", selectorText);
          }
          break;

        default:
          console.error("Unknown style operation type:", type);
      }
    } catch (error) {
      console.error("Error applying style operation:", error, operation);
    }
  };
  // Escuchar eventos de broadcast para indicadores visuales
  useEventListener(({ event, user }) => {
    if (event.type === "component-selected" && editor) {
      // Mostrar indicador visual de qué componente está seleccionando otro usuario
      const componentId = event.data.componentId;
      const component = editor.DomComponents.getById(componentId);

      if (component) {
        // Añadir clase CSS para mostrar que otro usuario lo tiene seleccionado
        const view = component.getView();
        if (view && view.el) {
          view.el.classList.add("remote-selected");

          // Remover la clase después de 2 segundos
          setTimeout(() => {
            if (view.el) {
              view.el.classList.remove("remote-selected");
            }
          }, 2000);
        }
      }
    }
  });

  return {
    setupGranularEvents,
    isApplyingRemoteChange: isApplyingRemoteChange.current,
  };
};
