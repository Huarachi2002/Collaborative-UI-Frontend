import { Editor } from 'grapesjs';
import { registerContainer } from './container';
import { registerTextField } from './textfield';
import { registerDropdown } from './dropdown';
import { registerRadioGroup } from './radiogroup';
import { registerSwitch } from './switch';
import { registerDatePicker } from './datepicker';
import { registerSlider } from './slider';
import { registerForm } from './form';

/**
 * Register all Flutter form components
 * @param editor - The GrapesJS editor instance
 */
export function registerFlutterFormComponents(editor: Editor): void {
  // Register container component
  registerContainer(editor);
  
  // Register form input components
  registerTextField(editor);
  registerDropdown(editor);
  registerRadioGroup(editor);
  registerSwitch(editor);
  registerDatePicker(editor);
  registerSlider(editor);
  
  // Register form container
  registerForm(editor);
}