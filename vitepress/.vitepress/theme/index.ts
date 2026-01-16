import Theme from 'vitepress/theme';
import 'virtual:group-icons.css';
import './custom.css';

import Tabs from './components/Tabs.vue';

export default {
  ...Theme,
  enhanceApp(params: any) {
    Theme.enhanceApp(params);

    params.app.component('Tabs', Tabs);
  },
};
