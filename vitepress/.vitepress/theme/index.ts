import Theme from 'vitepress/theme';
import './custom.css';

import { h } from 'vue';

import Accordion from './components/Accordion.vue';
import CodeView from './components/CodeView.vue';
import ComparisonTable from './components/ComparisonTable.vue';
import CustomNotFound from './components/CustomNotFound.vue';
import FrameworkSelect from './components/FrameworkSelect.vue';
import Link from './components/Link.vue';
import MainPagePatch from './components/MainPagePatch.vue';
import SizeComparisonChart from './components/SizeComparisonChart.vue';
import Tabs from './components/Tabs.vue';
import WidgetPreview from './components/WidgetPreview.vue';

export default {
  ...Theme,
  Layout() {
    return h(Theme.Layout, null, {
      'layout-top': () => h(MainPagePatch),
      'not-found': () => h(CustomNotFound),
    });
  },
  enhanceApp(params: any) {
    Theme.enhanceApp(params);

    params.app.component('Accordion', Accordion);
    params.app.component('FrameworkSelect', FrameworkSelect);
    params.app.component('Tabs', Tabs);
    params.app.component('ComparisonTable', ComparisonTable);
    params.app.component('SizeComparisonChart', SizeComparisonChart);
    params.app.component('CodeView', CodeView);
    params.app.component('Link', Link);
    params.app.component('WidgetPreview', WidgetPreview);
  },
};
