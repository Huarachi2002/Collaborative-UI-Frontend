import { Editor } from 'grapesjs';
import { FLUTTER_FORMS_CATEGORY } from '../utils/constants';
import { colorOptions, generateFlutterMetadata } from '../utils/helpers';

/**
 * Register the Flutter Radio Group component
 * @param editor - The GrapesJS editor instance
 */
export function registerRadioGroup(editor: Editor): void {
  const domComponents = editor.DomComponents;
  const blockManager = editor.Blocks;
  
  // Define the RadioGroup component
  domComponents.addType('flutter-radiogroup', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 
          class: 'flutter-radiogroup',
          'data-flutter-widget': 'RadioGroup',
          'data-flutter-package': 'material'
        },
        components: `
          <div style="width: 300px; margin: 16px; font-family: 'Roboto', sans-serif;"
               data-flutter-props='{
                 "groupValue": "Option 1",
                 "options": ["Option 1", "Option 2", "Option 3"],
                 "activeColor": "#2196F3"
               }'>
            <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px;" data-flutter-prop="title">Select one option:</div>
            <div data-flutter-prop="options">
              <div style="display: flex; align-items: center; margin-bottom: 8px;" data-flutter-value="Option 1">
                <div style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid #2196F3; margin-right: 10px; position: relative;">
                  <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #2196F3; position: absolute; top: 2px; left: 2px;"></div>
                </div>
                <div>Option 1</div>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 8px;" data-flutter-value="Option 2">
                <div style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid #999; margin-right: 10px; position: relative;"></div>
                <div>Option 2</div>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 8px;" data-flutter-value="Option 3">
                <div style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid #999; margin-right: 10px; position: relative;"></div>
                <div>Option 3</div>
              </div>
            </div>
          </div>
          ${generateFlutterMetadata({
            widget: "Column",
            properties: {
              children: "[Text('Select one option:'), RadioListTile(title: Text('Option 1'), value: 'Option 1', groupValue: 'Option 1', onChanged: (value) {}), RadioListTile(title: Text('Option 2'), value: 'Option 2', groupValue: 'Option 1', onChanged: (value) {}), RadioListTile(title: Text('Option 3'), value: 'Option 3', groupValue: 'Option 1', onChanged: (value) {})]"
            }
          })}
        `,
        traits: [
          {
            type: 'text',
            name: 'title',
            label: 'Group Title',
            default: 'Select one option:'
          },
          {
            type: 'text',
            name: 'options',
            label: 'Options (comma separated)',
            default: 'Option 1,Option 2,Option 3'
          },
          {
            type: 'text',
            name: 'groupValue',
            label: 'Selected Value',
            default: 'Option 1'
          },
          {
            type: 'select',
            name: 'activeColor',
            label: 'Active Color',
            options: colorOptions
          },
          {
            type: 'select',
            name: 'layout',
            label: 'Layout',
            options: [
              { id: 'vertical', name: 'Vertical' },
              { id: 'horizontal', name: 'Horizontal' }
            ]
          }
        ]
      },

      init() {
        this.on('change:traits', this.updateRadioGroupStyle);
      },

      updateRadioGroupStyle() {
        const title = this.getTrait('title')?.get('value') || 'Select one option:';
        const optionsStr = this.getTrait('options')?.get('value') || 'Option 1,Option 2,Option 3';
        const options = optionsStr.split(',').map(opt => opt.trim());
        const groupValue = this.getTrait('groupValue')?.get('value') || options[0] || 'Option 1';
        const activeColor = this.getTrait('activeColor')?.get('value') || '#2196F3';
        const layout = this.getTrait('layout')?.get('value') || 'vertical';

        const container = this.components().first();

        if (container) {
          const titleEl = container.find('[data-flutter-prop="title"]')[0];
          const optionsEl = container.find('[data-flutter-prop="options"]')[0];

          if (titleEl) {
            titleEl.components().reset(title);
          }

          if (optionsEl) {
            // Generate radio options
            const optionComponents = options.map(option => {
              const isSelected = option === groupValue;
              return `
                <div style="display: flex; align-items: center; margin-bottom: 8px; ${layout === 'horizontal' ? 'margin-right: 16px;' : ''}" data-flutter-value="${option}">
                  <div style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${isSelected ? activeColor : '#999'}; margin-right: 10px; position: relative;">
                    ${isSelected ? `<div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${activeColor}; position: absolute; top: 2px; left: 2px;"></div>` : ''}
                  </div>
                  <div>${option}</div>
                </div>
              `;
            }).join('');

            optionsEl.setStyle({
              display: layout === 'horizontal' ? 'flex' : 'block',
              'flex-wrap': layout === 'horizontal' ? 'wrap' : 'nowrap'
            });
            
            optionsEl.components(optionComponents);
          }

          // Update Flutter props
          const flutterProps = {
            groupValue,
            options,
            activeColor,
            layout
          };

          container.set('attributes', {
            ...container.get('attributes'),
            'data-flutter-props': JSON.stringify(flutterProps)
          });
        }
      }
    }
  });

  // Add the RadioGroup block
  blockManager.add('flutter-radiogroup', {
    label: 'Radio Group',
    category: FLUTTER_FORMS_CATEGORY,
    content: {
      type: 'flutter-radiogroup'
    },
    media: `<svg viewBox="0 0 24 24" fill="#2196F3" width="24" height="24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              <circle cx="12" cy="12" r="5"/>
            </svg>`
  });
}
