import { Editor } from 'grapesjs';
import { FLUTTER_CATEGORY } from '../utils/constants';
import { colorOptions, generateFlutterMetadata } from '../utils/helpers';

/**
 * Register the Flutter Floating Action Button widget
 * @param editor - The GrapesJS editor instance
 */
export function registerFAB(editor: Editor): void {
  const domComponents = editor.DomComponents;
  const blockManager = editor.Blocks;
  
  // Define the FAB component
  domComponents.addType('flutter-fab', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 
          class: 'flutter-fab',
          'data-flutter-widget': 'FloatingActionButton',
          'data-flutter-package': 'material'
        },
        components: `
          <div style="width: 56px; height: 56px; border-radius: 28px; background-color: #FF9800; box-shadow: 0 3px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer;"
               data-flutter-props='{
                 "backgroundColor": "#FF9800",
                 "elevation": 6,
                 "tooltip": "Add"
               }'>
            <svg viewBox="0 0 24 24" fill="white" width="24" height="24" data-flutter-icon="Icons.add">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            ${generateFlutterMetadata({
              widget: "FloatingActionButton",
              properties: {
                onPressed: "() {}",
                tooltip: "Add",
                backgroundColor: "Colors.orange",
                elevation: 6,
                child: "Icon(Icons.add)"
              }
            })}
          </div>
        `,
        traits: [
          {
            type: 'select',
            name: 'color',
            label: 'Color',
            options: colorOptions
          },
          {
            type: 'select',
            name: 'icon',
            label: 'Icon',
            options: [
              { id: 'add', name: 'Add' },
              { id: 'edit', name: 'Edit' },
              { id: 'favorite', name: 'Favorite' },
              { id: 'search', name: 'Search' },
              { id: 'delete', name: 'Delete' },
              { id: 'share', name: 'Share' },
            ]
          },
          {
            type: 'number',
            name: 'elevation',
            label: 'Elevation',
            default: 6,
            min: 0,
            max: 12
          },
          {
            type: 'select',
            name: 'size',
            label: 'Size',
            options: [
              { id: 'normal', name: 'Normal' },
              { id: 'small', name: 'Small' },
              { id: 'extended', name: 'Extended' }
            ]
          },
          {
            type: 'text',
            name: 'tooltip',
            label: 'Tooltip',
            default: 'Add'
          }
        ]
      },
      
      /**
       * Initialize the component
       */
      init() {
        this.on('change:traits', this.updateFabStyle);
      },
      
      /**
       * Update the FAB style based on trait changes
       */
      updateFabStyle() {
        const color = this.getTrait('color')?.get('value') || '#FF9800';
        const icon = this.getTrait('icon')?.get('value') || 'add';
        const elevation = this.getTrait('elevation')?.get('value') || 6;
        const size = this.getTrait('size')?.get('value') || 'normal';
        const tooltip = this.getTrait('tooltip')?.get('value') || 'Add';
        
        // Get the FAB element
        const fabEl = this.components().first();
        
        if (fabEl) {
          // Set dimensions and styles based on size
          let width = 56;
          let height = 56;
          let borderRadius = 28;
          
          if (size === 'small') {
            width = 40;
            height = 40;
            borderRadius = 20;
          } else if (size === 'extended') {
            width = 'auto';
            height = 48;
            borderRadius = 24;
          }
          
          // Update styles
          fabEl.setStyle({
            'background-color': color,
            'box-shadow': `0 ${elevation/2}px ${elevation}px rgba(0,0,0,0.3)`,
            'width': typeof width === 'number' ? `${width}px` : width,
            'height': `${height}px`,
            'border-radius': `${borderRadius}px`,
            'padding': size === 'extended' ? '0 16px' : '0'
          });
          
          // Update icon
          const iconEl = fabEl.find('svg')[0];
          if (iconEl) {
            // Different SVG path depending on the icon
            let path = '';
            
            switch (icon) {
              case 'add':
                path = 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z';
                break;
              case 'edit':
                path = 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z';
                break;
              case 'favorite':
                path = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';
                break;
              case 'search':
                path = 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z';
                break;
              case 'delete':
                path = 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z';
                break;
              case 'share':
                path = 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z';
                break;
            }
            
            iconEl.set('content', `<path d="${path}"/>`);
            iconEl.set('attributes', {
              ...iconEl.get('attributes'),
              'data-flutter-icon': `Icons.${icon}`
            });
          }
          
          // Add text if extended
          if (size === 'extended') {
            // Check if we already have a label
            let labelEl = fabEl.find('[data-flutter-part="label"]')[0];
            
            if (!labelEl && iconEl) {
              // Create and add label after icon
              fabEl.append(`<div data-flutter-part="label" style="margin-left: 8px; color: white; font-weight: 500;">${tooltip}</div>`);
            } else if (labelEl) {
              // Update existing label
              labelEl.components(tooltip);
            }
          } else {
            // Remove label if not extended
            const labelEl = fabEl.find('[data-flutter-part="label"]')[0];
            if (labelEl) {
              fabEl.components().remove(labelEl);
            }
          }
          
          // Update Flutter metadata
          const flutterProps = {
            backgroundColor: color,
            elevation,
            tooltip,
            icon: `Icons.${icon}`,
            size
          };
          
          fabEl.set('attributes', {
            ...fabEl.get('attributes'),
            'data-flutter-props': JSON.stringify(flutterProps)
          });
        }
      }
    }
  });
  
  // Register the block
  blockManager.add('flutter-fab-block', {
    label: 'FloatingActionButton',
    category: FLUTTER_CATEGORY,
    content: { type: 'flutter-fab' },
    media: `<svg viewBox="0 0 24 24" fill="#FF9800" width="24" height="24">
      <circle cx="12" cy="12" r="10"/>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="white"/>
    </svg>`
  });
}
