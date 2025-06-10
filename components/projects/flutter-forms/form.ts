import { Editor } from 'grapesjs';
import { FLUTTER_FORMS_CATEGORY } from '../utils/constants';
import { generateFlutterMetadata } from '../utils/helpers';

/**
 * Register the Flutter Form component
 * @param editor - The GrapesJS editor instance
 */
export function registerForm(editor: Editor): void {
  const domComponents = editor.DomComponents;
  const blockManager = editor.Blocks;
  
  // Define the Form component
  domComponents.addType('flutter-form', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 
          class: 'flutter-form',
          'data-flutter-widget': 'Form',
          'data-flutter-package': 'material'
        },
        components: `
          <div style="width: 100%; border: 1px dashed #ccc; padding: 16px; box-sizing: border-box; min-height: 200px; border-radius: 4px; background-color: #FAFAFA; font-family: 'Roboto', sans-serif;"
               data-flutter-props='{
                 "autovalidateMode": "onUserInteraction",
                 "onChanged": "() {}",
                 "onWillPop": "() => Future.value(true)"
               }'>
            <div style="font-size: 18px; font-weight: 500; color: #333; margin-bottom: 16px; text-align: center;" data-flutter-prop="title">Form Container</div>
            <div style="font-size: 14px; color: #666; margin-bottom: 16px; text-align: center;" data-flutter-prop="description">Drag form elements here</div>
            <div data-gjs-droppable="true" data-gjs-name="Form Content" data-flutter-prop="content" style="min-height: 100px;"></div>
            <div style="margin-top: 16px; text-align: right;">
              <div style="display: inline-block; padding: 8px 16px; background-color: #2196F3; color: white; border-radius: 4px; cursor: pointer; font-weight: 500;" data-flutter-prop="submitButton">Submit</div>
            </div>
          </div>
          ${generateFlutterMetadata({
            widget: "Form",
            properties: {
              key: "formKey",
              autovalidateMode: "AutovalidateMode.onUserInteraction",
              child: "Column(children: [Text('Form Container'), Padding(padding: EdgeInsets.all(16.0), child: /* Form fields go here */), ElevatedButton(onPressed: () {}, child: Text('Submit'))])"
            }
          })}
        `,
        draggable: '.gjs-body',
        droppable: true,
        traits: [
          {
            type: 'text',
            name: 'title',
            label: 'Form Title',
            default: 'Form Container'
          },
          {
            type: 'text',
            name: 'description',
            label: 'Form Description',
            default: 'Drag form elements here'
          },
          {
            type: 'text',
            name: 'submitButtonText',
            label: 'Submit Button Text',
            default: 'Submit'
          },
          {
            type: 'select',
            name: 'autovalidateMode',
            label: 'Auto Validate',
            options: [
              { id: 'disabled', name: 'Disabled' },
              { id: 'onUserInteraction', name: 'On User Interaction' },
              { id: 'always', name: 'Always' }
            ]
          },
          {
            type: 'checkbox',
            name: 'scrollable',
            label: 'Scrollable Form',
            default: true
          }
        ]
      },

      init() {
        this.on('change:traits', this.updateFormStyle);
      },

      updateFormStyle() {
        const title = this.getTrait('title')?.get('value') || 'Form Container';
        const description = this.getTrait('description')?.get('value') || 'Drag form elements here';
        const submitButtonText = this.getTrait('submitButtonText')?.get('value') || 'Submit';
        const autovalidateMode = this.getTrait('autovalidateMode')?.get('value') || 'onUserInteraction';
        const scrollable = this.getTrait('scrollable')?.get('value') || true;

        const container = this.components().first();
        
        if (container) {
          const titleEl = container.find('[data-flutter-prop="title"]')[0];
          const descriptionEl = container.find('[data-flutter-prop="description"]')[0];
          const submitButtonEl = container.find('[data-flutter-prop="submitButton"]')[0];
          const contentEl = container.find('[data-flutter-prop="content"]')[0];

          if (titleEl) {
            titleEl.components().reset(title);
          }

          if (descriptionEl) {
            descriptionEl.components().reset(description);
          }

          if (submitButtonEl) {
            submitButtonEl.components().reset(submitButtonText);
          }

          if (contentEl && scrollable) {
            contentEl.setStyle({
              'overflow-y': 'auto',
              'max-height': '400px'
            });
          } else if (contentEl) {
            contentEl.setStyle({
              'overflow-y': 'visible',
              'max-height': 'none'
            });
          }

          // Update Flutter props
          const flutterProps = {
            autovalidateMode,
            scrollable,
            submitButtonText,
            title,
            description
          };

          container.set('attributes', {
            ...container.get('attributes'),
            'data-flutter-props': JSON.stringify(flutterProps)
          });
        }
      }
    }
  });

  // Add the Form block
  blockManager.add('flutter-form', {
    label: 'Form Container',
    category: FLUTTER_FORMS_CATEGORY,
    content: {
      type: 'flutter-form'
    },
    media: `<svg viewBox="0 0 24 24" fill="#2196F3" width="24" height="24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>`
  });
}
