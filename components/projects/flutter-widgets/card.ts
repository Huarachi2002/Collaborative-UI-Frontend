import { Editor } from 'grapesjs';
import { FLUTTER_CATEGORY } from '../utils/constants';
import { colorOptions, generateFlutterMetadata } from '../utils/helpers';

/**
 * Register the Flutter Card widget
 * @param editor - The GrapesJS editor instance
 */
export function registerCard(editor: Editor): void {
  const domComponents = editor.DomComponents;
  const blockManager = editor.Blocks;
  
  // Define the Card component
  domComponents.addType('flutter-card', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 
          class: 'flutter-card',
          'data-flutter-widget': 'Card',
          'data-flutter-package': 'material'
        },
        components: `
          <div style="width: 320px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); overflow: hidden; margin: 16px; font-family: 'Roboto', sans-serif;"
               data-flutter-props='{
                 "elevation": 2,
                 "shape": "RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))",
                 "clipBehavior": "Clip.antiAlias"
               }'>
            <div style="height: 180px; background-color: #F5F5F5; display: flex; align-items: center; justify-content: center;" data-flutter-part="image">
              <svg viewBox="0 0 24 24" fill="#9E9E9E" width="48" height="48">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            <div style="padding: 16px;" data-flutter-part="content">
              <div style="font-size: 20px; font-weight: 500; color: #212121; margin-bottom: 8px;" data-flutter-prop="title">Card Title</div>
              <div style="font-size: 14px; color: #757575; margin-bottom: 16px;" data-flutter-prop="subtitle">Card widget that can contain images, text, and buttons.</div>
              <div style="display: flex; justify-content: flex-end; gap: 8px;" data-flutter-part="actions">
                <div style="padding: 8px 16px; font-weight: 500; color: #2196F3; cursor: pointer; text-transform: uppercase; font-size: 14px;" data-flutter-action="cancel">Cancel</div>
                <div style="padding: 8px 16px; font-weight: 500; color: #2196F3; cursor: pointer; text-transform: uppercase; font-size: 14px;" data-flutter-action="accept">Accept</div>
              </div>
            </div>
            ${generateFlutterMetadata({
              widget: "Card",
              properties: {
                elevation: 2,
                shape: "RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))",
                clipBehavior: "Clip.antiAlias",
                child: "Column(children: [Image.asset('placeholder.png'), CardContent(title: 'Card Title', description: 'Card description')])"
              }
            })}
          </div>
        `,
        traits: [
          {
            type: 'text',
            name: 'title',
            label: 'Title',
            default: 'Card Title'
          },
          {
            type: 'text',
            name: 'content',
            label: 'Content',
            default: 'Card widget that can contain images, text, and buttons.'
          },
          {
            type: 'number',
            name: 'elevation',
            label: 'Elevation',
            default: 2,
            min: 0,
            max: 24
          },
          {
            type: 'number',
            name: 'borderRadius',
            label: 'Border Radius',
            default: 12
          },
          {
            type: 'checkbox',
            name: 'showImage',
            label: 'Show Image',
            default: true
          },
          {
            type: 'checkbox',
            name: 'showActions',
            label: 'Show Action Buttons',
            default: true
          }
        ]
      },
      
      /**
       * Initialize the component
       */
      init() {
        this.on('change:traits', this.updateCardStyle);
      },
      
      /**
       * Update the Card style based on trait changes
       */
      updateCardStyle() {
        const title = this.getTrait('title')?.get('value') || 'Card Title';
        const content = this.getTrait('content')?.get('value') || 'Card widget that can contain images, text, and buttons.';
        const elevation = this.getTrait('elevation')?.get('value') || 2;
        const borderRadius = this.getTrait('borderRadius')?.get('value') || 12;
        const showImage = this.getTrait('showImage')?.get('value') || true;
        const showActions = this.getTrait('showActions')?.get('value') || true;
        
        // Get the Card element
        const cardEl = this.components().first();
        
        if (cardEl) {
          // Update styles
          cardEl.setStyle({
            'border-radius': `${borderRadius}px`,
            'box-shadow': `0 ${elevation/2}px ${elevation}px rgba(0,0,0,0.12), 0 ${elevation/2}px ${elevation/2}px rgba(0,0,0,0.24)`
          });
          
          // Update title and content
          const titleEl = cardEl.find('[data-flutter-prop="title"]')[0];
          if (titleEl) {
            titleEl.components(title);
          }
          
          const subtitleEl = cardEl.find('[data-flutter-prop="subtitle"]')[0];
          if (subtitleEl) {
            subtitleEl.components(content);
          }
          
          // Update image visibility
          const imageEl = cardEl.find('[data-flutter-part="image"]')[0];
          if (imageEl) {
            imageEl.setStyle({
              'display': showImage ? 'flex' : 'none'
            });
          }
          
          // Update actions visibility
          const actionsEl = cardEl.find('[data-flutter-part="actions"]')[0];
          if (actionsEl) {
            actionsEl.setStyle({
              'display': showActions ? 'flex' : 'none'
            });
          }
          
          // Update Flutter metadata
          const flutterProps = {
            elevation,
            shape: `RoundedRectangleBorder(borderRadius: BorderRadius.circular(${borderRadius}))`,
            clipBehavior: "Clip.antiAlias",
            showImage,
            showActions,
            title,
            content
          };
          
          cardEl.set('attributes', {
            ...cardEl.get('attributes'),
            'data-flutter-props': JSON.stringify(flutterProps)
          });
        }
      }
    }
  });
  
  // Register the block
  blockManager.add('flutter-card-block', {
    label: 'Card',
    category: FLUTTER_CATEGORY,
    content: { type: 'flutter-card' },
    media: `<svg viewBox="0 0 24 24" fill="#9E9E9E" width="24" height="24">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z"/>
    </svg>`
  });
}
