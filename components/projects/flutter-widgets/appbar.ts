import { Editor } from 'grapesjs';
import { FLUTTER_CATEGORY } from '../utils/constants';
import { colorOptions, generateFlutterMetadata } from '../utils/helpers';

/**
 * Register the Flutter AppBar widget
 * @param editor - The GrapesJS editor instance
 */
export function registerAppBar(editor: Editor): void {
  const domComponents = editor.DomComponents;
  const blockManager = editor.Blocks;
  
  // Define the AppBar component
  domComponents.addType('flutter-appbar', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 
          class: 'flutter-appbar',
          'data-flutter-widget': 'AppBar',
          'data-flutter-package': 'material'
        },
        components: `
          <div style="width: 100%; height: 56px; background-color: #2196F3; color: white; display: flex; align-items: center; padding: 0 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-family: 'Roboto', sans-serif;"
               data-flutter-props='{
                 "backgroundColor": "#2196F3",
                 "elevation": 4,
                 "titleSpacing": 16
               }'>
            <div style="width: 24px; height: 24px; margin-right: 32px;" data-flutter-prop="leading" data-flutter-value="Icons.arrow_back">
              <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </div>
            <div style="font-size: 20px; font-weight: 500; flex: 1;" data-flutter-prop="title">AppBar Title</div>
            <div style="display: flex; gap: 16px;" data-flutter-prop="actions">
              <!-- Cada acción con su propio atributo -->
              <div style="width: 24px; height: 24px;" data-flutter-action="search">
                <svg viewBox="0 0 24 24" fill="white" width="24" height="24" data-flutter-icon="Icons.search">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </div>
              <!-- Otras acciones -->
              <div style="width: 24px; height: 24px;" data-flutter-action="notifications">
                <svg viewBox="0 0 24 24" fill="white" width="24" height="24" data-flutter-icon="Icons.notifications">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                </svg>
              </div>
            </div>
            ${generateFlutterMetadata({
              widget: "AppBar",
              properties: {
                title: "Text('AppBar Title')",
                leading: "IconButton(icon: Icon(Icons.arrow_back), onPressed: () {})",
                actions: [
                  "IconButton(icon: Icon(Icons.search), onPressed: () {})",
                  "IconButton(icon: Icon(Icons.notifications), onPressed: () {})"
                ],
                backgroundColor: "Colors.blue",
                elevation: 4
              }
            })}
          </div>
        `,
        traits: [
          {
            type: 'text',
            name: 'title',
            label: 'Title',
            default: 'AppBar Title'
          },
          {
            type: 'select',
            name: 'color',
            label: 'Color',
            options: colorOptions
          },
          {
            type: 'checkbox',
            name: 'showLeading',
            label: 'Show Back Button',
            default: true
          },
          {
            type: 'checkbox',
            name: 'showActions',
            label: 'Show Action Buttons',
            default: true
          },
          {
            type: 'number',
            name: 'elevation',
            label: 'Elevation',
            default: 4
          }
        ]
      },
      
      /**
       * Initialize the component
       */
      init() {
        this.on('change:traits', this.updateAppBarStyle);
      },
      
      /**
       * Update the AppBar style based on trait changes
       */
      updateAppBarStyle() {
        const title = this.getTrait('title')?.get('value') || 'AppBar Title';
        const color = this.getTrait('color')?.get('value') || '#2196F3';
        const showLeading = this.getTrait('showLeading')?.get('value') || true;
        const showActions = this.getTrait('showActions')?.get('value') || true;
        const elevation = this.getTrait('elevation')?.get('value') || 4;
        
        // Get the AppBar element
        const appBarEl = this.components().first();
        
        if (appBarEl) {
          // Update styles
          appBarEl.setStyle({
            'background-color': color,
            'box-shadow': `0 ${elevation/2}px ${elevation}px rgba(0,0,0,0.1)`
          });
          
          // Update title
          const titleEl = appBarEl.find('[data-flutter-prop="title"]')[0];
          if (titleEl) {
            titleEl.components(title);
          }
          
          // Update leading icon visibility
          const leadingEl = appBarEl.find('[data-flutter-prop="leading"]')[0];
          if (leadingEl) {
            leadingEl.setStyle({
              'display': showLeading ? 'block' : 'none'
            });
          }
          
          // Update actions visibility
          const actionsEl = appBarEl.find('[data-flutter-prop="actions"]')[0];
          if (actionsEl) {
            actionsEl.setStyle({
              'display': showActions ? 'flex' : 'none'
            });
          }
          
          // Update Flutter metadata
          const flutterProps = {
            backgroundColor: color,
            elevation: elevation,
            title: title,
            showLeading,
            showActions
          };
          
          appBarEl.set('attributes', {
            ...appBarEl.get('attributes'),
            'data-flutter-props': JSON.stringify(flutterProps)
          });
        }
      }
    }
  });
  
  // Register the block
  blockManager.add('flutter-appbar-block', {
    label: 'AppBar',
    category: FLUTTER_CATEGORY,
    content: { type: 'flutter-appbar' },
    media: `<svg viewBox="0 0 24 24" fill="#2196F3" width="24" height="24">
      <path d="M5 3h14c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z"/>
      <path d="M4 13h16v8H4z" fill="none" stroke="#2196F3" stroke-width="2"/>
    </svg>`
  });
}
