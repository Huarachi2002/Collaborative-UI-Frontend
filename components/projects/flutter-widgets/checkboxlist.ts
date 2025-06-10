import { Editor } from 'grapesjs';
import { FLUTTER_CATEGORY } from '../utils/constants';
import { colorOptions, generateFlutterMetadata } from '../utils/helpers';

/**
 * Register the Flutter CheckboxList widget
 * @param editor - The GrapesJS editor instance
 */
export function registerCheckboxList(editor: Editor): void {
  const domComponents = editor.DomComponents;
  const blockManager = editor.Blocks;
  
  // Define the CheckboxList component
  domComponents.addType('flutter-listcheck', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 
          class: 'flutter-listcheck',
          'data-flutter-widget': 'CheckboxListTile',
          'data-flutter-package': 'material'
        },
        components: `
          <div style="width: 320px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.12); font-family: 'Roboto', sans-serif; overflow: hidden;"
               data-flutter-props='{
                 "dense": false,
                 "checkColor": "#FFFFFF",
                 "activeColor": "#2196F3"
               }'>
            <div style="padding: 16px; font-size: 16px; color: #212121; font-weight: 500; border-bottom: 1px solid #f5f5f5;">CheckboxListTile</div>
            
            <div style="display: flex; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f5f5f5;" data-flutter-item="0" data-flutter-checked="true">
              <div style="width: 24px; height: 24px; border-radius: 2px; border: 2px solid #2196F3; margin-right: 16px; display: flex; align-items: center; justify-content: center;" data-flutter-part="checkbox">
                <div style="width: 14px; height: 14px; background-color: #2196F3;"></div>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 16px; color: #212121;" data-flutter-prop="title">Primary option</div>
                <div style="font-size: 14px; color: #757575; margin-top: 4px;" data-flutter-prop="subtitle">Supporting text</div>
              </div>
            </div>
            
            <div style="display: flex; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f5f5f5;" data-flutter-item="1" data-flutter-checked="false">
              <div style="width: 24px; height: 24px; border-radius: 2px; border: 2px solid #2196F3; margin-right: 16px;" data-flutter-part="checkbox"></div>
              <div style="flex: 1;">
                <div style="font-size: 16px; color: #212121;" data-flutter-prop="title">Secondary option</div>
                <div style="font-size: 14px; color: #757575; margin-top: 4px;" data-flutter-prop="subtitle">Supporting text</div>
              </div>
            </div>
            
            <div style="display: flex; align-items: center; padding: 12px 16px;" data-flutter-item="2" data-flutter-checked="false" data-flutter-disabled="true">
              <div style="width: 24px; height: 24px; border-radius: 2px; border: 2px solid #9E9E9E; margin-right: 16px;" data-flutter-part="checkbox"></div>
              <div style="flex: 1;">
                <div style="font-size: 16px; color: #9E9E9E;" data-flutter-prop="title">Disabled option</div>
                <div style="font-size: 14px; color: #BDBDBD; margin-top: 4px;" data-flutter-prop="subtitle">Supporting text</div>
              </div>
            </div>
            ${generateFlutterMetadata({
              widget: "Column",
              children: [
                "Padding(padding: EdgeInsets.all(16), child: Text('CheckboxListTile', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)))",
                "CheckboxListTile(title: Text('Primary option'), subtitle: Text('Supporting text'), value: true, onChanged: (val) {})",
                "CheckboxListTile(title: Text('Secondary option'), subtitle: Text('Supporting text'), value: false, onChanged: (val) {})",
                "CheckboxListTile(title: Text('Disabled option'), subtitle: Text('Supporting text'), value: false, onChanged: null)"
              ]
            })}
          </div>
        `,
        traits: [
          {
            type: 'number',
            name: 'items',
            label: 'Items Count',
            default: 3,
            min: 1,
            max: 10
          },
          {
            type: 'select',
            name: 'activeColor',
            label: 'Active Color',
            options: colorOptions
          },
          {
            type: 'checkbox',
            name: 'dense',
            label: 'Dense',
            default: false
          },
          {
            type: 'checkbox',
            name: 'showSubtitles',
            label: 'Show Subtitles',
            default: true
          },
          {
            type: 'text',
            name: 'headerText',
            label: 'Header Text',
            default: 'CheckboxListTile'
          }
        ]
      },
      
      /**
       * Initialize the component
       */
      init() {
        this.on('change:traits', this.updateCheckboxListStyle);
      },
      
      /**
       * Update the CheckboxList style based on trait changes
       */
      updateCheckboxListStyle() {
        const itemsCount = this.getTrait('items')?.get('value') || 3;
        const activeColor = this.getTrait('activeColor')?.get('value') || '#2196F3';
        const dense = this.getTrait('dense')?.get('value') || false;
        const showSubtitles = this.getTrait('showSubtitles')?.get('value') || true;
        const headerText = this.getTrait('headerText')?.get('value') || 'CheckboxListTile';
        
        // Get the container element
        const containerEl = this.components().first();
        
        if (containerEl) {
          // Update header text
          const headerEl = containerEl.find('div')[0];
          if (headerEl) {
            headerEl.components(headerText);
          }
          
          // Get all checkbox items
          const itemEls = containerEl.find('[data-flutter-item]');
          
          // Update each item based on traits
          itemEls.forEach((item, index) => {
            // Show/hide based on itemsCount
            if (index < itemsCount) {
              item.setStyle({ display: 'flex' });
              
              // Apply dense style if needed
              const padding = dense ? '8px 16px' : '12px 16px';
              item.setStyle({ padding });
              
              // Update checkbox color
              const checkboxEl = item.find('[data-flutter-part="checkbox"]')[0];
              if (checkboxEl) {
                const isChecked = item.get('attributes')['data-flutter-checked'] === 'true';
                const isDisabled = item.get('attributes')['data-flutter-disabled'] === 'true';
                
                // Set appropriate color based on state
                const borderColor = isDisabled ? '#9E9E9E' : activeColor;
                checkboxEl.setStyle({ 'border-color': borderColor });
                
                // Update the inner checkbox indicator
                const innerEl = checkboxEl.find('div')[0];
                if (isChecked && !innerEl) {
                  checkboxEl.append(`<div style="width: 14px; height: 14px; background-color: ${activeColor};"></div>`);
                } else if (innerEl && isChecked) {
                  innerEl.setStyle({ 'background-color': activeColor });
                } else if (innerEl && !isChecked) {
                  checkboxEl.components().remove(innerEl);
                }
              }
              
              // Update subtitle visibility
              const subtitleEl = item.find('[data-flutter-prop="subtitle"]')[0];
              if (subtitleEl) {
                subtitleEl.setStyle({ display: showSubtitles ? 'block' : 'none' });
              }
            } else {
              item.setStyle({ display: 'none' });
            }
          });
          
          // Update Flutter metadata
          const flutterProps = {
            itemsCount,
            activeColor,
            dense,
            showSubtitles,
            headerText
          };
          
          containerEl.set('attributes', {
            ...containerEl.get('attributes'),
            'data-flutter-props': JSON.stringify(flutterProps)
          });
        }
      }
    }
  });
  
  // Register the block
  blockManager.add('flutter-listcheck-block', {
    label: 'CheckList',
    category: FLUTTER_CATEGORY,
    content: { type: 'flutter-listcheck' },
    media: `<svg viewBox="0 0 24 24" fill="#4CAF50" width="24" height="24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>`
  });
}
