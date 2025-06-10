import { Editor } from 'grapesjs';
import { FLUTTER_FORMS_CATEGORY } from '../utils/constants';
import { colorOptions, generateFlutterMetadata } from '../utils/helpers';

/**
 * Register the Flutter TextField component
 * @param editor - The GrapesJS editor instance
 */
export function registerTextField(editor: Editor): void {
  const domComponents = editor.DomComponents;
  const blockManager = editor.Blocks;
  
  // Define the TextField component
  domComponents.addType('flutter-textfield', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 
          class: 'flutter-textfield',
          'data-flutter-widget': 'TextField',
          'data-flutter-package': 'material'
        },
        components: `
          <div style="width: 300px; margin: 16px; font-family: 'Roboto', sans-serif;"
               data-flutter-props='{
                 "decoration": {
                   "labelText": "Username",
                   "hintText": "Enter your username",
                   "border": "OutlineInputBorder()"
                 },
                 "keyboardType": "text",
                 "obscureText": false
               }'>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;" data-flutter-prop="label">Username</div>
            <div style="border: 1px solid #ccc; border-radius: 4px; padding: 10px 12px; position: relative; background-color: white; box-sizing: border-box; width: 100%;" data-flutter-prop="input">
              <div style="color: #999; position: absolute; pointer-events: none;" data-flutter-prop="hint">Enter your username</div>
            </div>
            <div style="font-size: 12px; color: #F44336; margin-top: 4px; min-height: 16px;" data-flutter-prop="error"></div>
          </div>
          ${generateFlutterMetadata({
            widget: "TextField",
            properties: {
              decoration: "InputDecoration(labelText: 'Username', hintText: 'Enter your username', border: OutlineInputBorder())",
              keyboardType: "TextInputType.text",
              obscureText: "false"
            }
          })}
        `,
        traits: [
          {
            type: 'text',
            name: 'label',
            label: 'Label Text',
            default: 'Username'
          },
          {
            type: 'text',
            name: 'hint',
            label: 'Hint Text',
            default: 'Enter your username'
          },
          {
            type: 'select',
            name: 'keyboardType',
            label: 'Keyboard Type',
            options: [
              { id: 'text', name: 'Text' },
              { id: 'number', name: 'Number' },
              { id: 'email', name: 'Email' },
              { id: 'phone', name: 'Phone' },
              { id: 'multiline', name: 'Multiline' }
            ]
          },
          {
            type: 'checkbox',
            name: 'obscureText',
            label: 'Password Field',
            default: false
          },
          {
            type: 'select',
            name: 'borderType',
            label: 'Border Type',
            options: [
              { id: 'outline', name: 'Outline' },
              { id: 'underline', name: 'Underline' },
              { id: 'none', name: 'None' }
            ]
          },
          {
            type: 'text',
            name: 'errorText',
            label: 'Error Text'
          }
        ]
      },

      init() {
        this.on('change:traits', this.updateTextFieldStyle);
      },

      updateTextFieldStyle() {
        const label = this.getTrait('label')?.get('value') || 'Username';
        const hint = this.getTrait('hint')?.get('value') || 'Enter your username';
        const keyboardType = this.getTrait('keyboardType')?.get('value') || 'text';
        const obscureText = this.getTrait('obscureText')?.get('value') || false;
        const borderType = this.getTrait('borderType')?.get('value') || 'outline';
        const errorText = this.getTrait('errorText')?.get('value') || '';

        const container = this.components().first();

        if (container) {
          const labelEl = container.find('[data-flutter-prop="label"]')[0];
          const inputEl = container.find('[data-flutter-prop="input"]')[0];
          const hintEl = container.find('[data-flutter-prop="hint"]')[0];
          const errorEl = container.find('[data-flutter-prop="error"]')[0];

          if (labelEl) {
            labelEl.components().reset(label);
          }

          if (hintEl) {
            hintEl.components().reset(hint);
          }

          if (errorEl) {
            errorEl.components().reset(errorText);
          }

          if (inputEl) {
            let inputStyles = {
              padding: '10px 12px',
              position: 'relative',
              'background-color': 'white',
              'box-sizing': 'border-box',
              width: '100%'
            };

            if (borderType === 'outline') {
              inputStyles['border'] = '1px solid #ccc';
              inputStyles['border-radius'] = '4px';
            } else if (borderType === 'underline') {
              inputStyles['border'] = 'none';
              inputStyles['border-bottom'] = '1px solid #ccc';
              inputStyles['border-radius'] = '0';
            } else {
              inputStyles['border'] = 'none';
            }

            inputEl.setStyle(inputStyles);
          }

          // Update Flutter props
          const flutterProps = {
            decoration: {
              labelText: label,
              hintText: hint,
              errorText: errorText || null,
              border: borderType === 'outline' ? 'OutlineInputBorder()' : 
                     borderType === 'underline' ? 'UnderlineInputBorder()' : 
                     'InputBorder.none'
            },
            keyboardType: keyboardType === 'number' ? 'TextInputType.number' :
                         keyboardType === 'email' ? 'TextInputType.emailAddress' :
                         keyboardType === 'phone' ? 'TextInputType.phone' :
                         keyboardType === 'multiline' ? 'TextInputType.multiline' : 
                         'TextInputType.text',
            obscureText: obscureText
          };

          container.set('attributes', {
            ...container.get('attributes'),
            'data-flutter-props': JSON.stringify(flutterProps)
          });
        }
      }
    }
  });

  // Add the TextField block
  blockManager.add('flutter-textfield', {
    label: 'Text Field',
    category: FLUTTER_FORMS_CATEGORY,
    content: {
      type: 'flutter-textfield'
    },
    media: `<svg viewBox="0 0 24 24" fill="#2196F3" width="24" height="24">
              <path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 14H4c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1z"/>
              <path d="M6 10h12v2H6z"/>
            </svg>`
  });
}
