import { Editor } from 'grapesjs';
import { registerAppBar } from './appbar';
import { registerBottomNav } from './bottomnav';
import { registerCard } from './card';
import { registerFAB } from './fab';
import { registerCheckboxList } from './checkboxlist';

/**
 * Register all Flutter UI widget components
 * @param editor - The GrapesJS editor instance
 */
export function registerFlutterWidgets(editor: Editor): void {
  // Register base Flutter widgets
  registerAppBar(editor);
  registerBottomNav(editor);
  registerCard(editor);
  registerFAB(editor);
  
  // Register list-based widgets
  registerCheckboxList(editor);
}
