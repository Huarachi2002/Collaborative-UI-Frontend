import { Editor } from 'grapesjs';
import { FLUTTER_FORMS_CATEGORY } from '../utils/constants';
import { colorOptions, generateFlutterMetadata } from '../utils/helpers';

/**
 * Register the Flutter Dropdown component
 * @param editor - The GrapesJS editor instance
 */
export function registerDropdown(editor: Editor): void {
  const domComponents = editor.DomComponents;
  const blockManager = editor.Blocks;
  
  // Define the Dropdown component
  domComponents.addType('flutter-dropdown', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 
          class: 'flutter-dropdown',
          'data-flutter-widget': 'DropdownButton',
          'data-flutter-package': 'material'
        },
        components: `
          <div style="width: 300px; margin: 16px; font-family: 'Roboto', sans-serif; position: relative;"
               data-flutter-props='{
                 "items": ["Option 1", "Option 2", "Option 3"],
                 "value": "Option 1",
                 "isExpanded": true,
                 "hint": "Select an option"
               }'>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;" data-flutter-prop="label">Select an option</div>
            <div style="border: 1px solid #ccc; border-radius: 4px; padding: 12px; position: relative; background-color: white; display: flex; justify-content: space-between; align-items: center;" data-flutter-prop="input">
              <div data-flutter-prop="value">Option 1</div>
              <svg viewBox="0 0 24 24" fill="#666" width="16" height="16">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </div>
          </div>
          ${generateFlutterMetadata({
            widget: "DropdownButton",
            properties: {
              value: "'Option 1'",
              items: "[DropdownMenuItem(value: 'Option 1', child: Text('Option 1')), DropdownMenuItem(value: 'Option 2', child: Text('Option 2')), DropdownMenuItem(value: 'Option 3', child: Text('Option 3'))]",
              onChanged: "(value) {}",
              isExpanded: "true",
              hint: "Text('Select an option')"
            }
          })}
        `,
        traits: [
          {
            type: 'text',
            name: 'label',
            label: 'Label Text',
            default: 'Select an option'
          },
          {
            type: 'text',
            name: 'options',
            label: 'Options (comma separated)',
            default: 'Option 1,Option 2,Option 3'
          },
          {
            type: 'text',
            name: 'value',
            label: 'Selected Value',
            default: 'Option 1'
          },
          {
            type: 'checkbox',
            name: 'isExpanded',
            label: 'Expand Full Width',
            default: true
          },
          {
            type: 'select',
            name: 'themeColor',
            label: 'Theme Color',
            options: colorOptions
          }
        ]
      },

      init() {
        this.on('change:traits', this.updateDropdownStyle);
      },

      updateDropdownStyle() {
        const label = this.getTrait('label')?.get('value') || 'Select an option';
        const optionsStr = this.getTrait('options')?.get('value') || 'Option 1,Option 2,Option 3';
        const options = optionsStr.split(',').map(opt => opt.trim());
        const value = this.getTrait('value')?.get('value') || options[0] || 'Option 1';
        const isExpanded = this.getTrait('isExpanded')?.get('value') || true;
        const themeColor = this.getTrait('themeColor')?.get('value') || '#2196F3';

        const container = this.components().first();

        if (container) {
          const labelEl = container.find('[data-flutter-prop="label"]')[0];
          const valueEl = container.find('[data-flutter-prop="value"]')[0];

          if (labelEl) {
            labelEl.components().reset(label);
          }

          if (valueEl) {
            valueEl.components().reset(value);
          }

          const inputEl = container.find('[data-flutter-prop="input"]')[0];
          if (inputEl) {
            inputEl.setStyle({
              width: isExpanded ? '100%' : 'auto',
              'border-color': value ? '#ccc' : themeColor
            });
          }

          // Update Flutter props
          const flutterProps = {
            items: options,
            value,
            isExpanded,
            hint: `Text('${label}')`,
          };

          container.set('attributes', {
            ...container.get('attributes'),
            'data-flutter-props': JSON.stringify(flutterProps)
          });
        }
      }
    }
  });

  // Add the Dropdown block
  blockManager.add('flutter-dropdown', {
    label: 'Dropdown',
    category: FLUTTER_FORMS_CATEGORY,
    content: {
      type: 'flutter-dropdown'
    },
    media: `<svg viewBox="0 0 24 24" fill="#2196F3" width="24" height="24">
              <path d="M7 10l5 5 5-5H7z"/>
            </svg>`
  });
}
