import Theme from 'vitepress/theme';
import 'virtual:group-icons.css';
import './custom.css';

import ComparisonTable from './components/ComparisonTable.vue';
import FrameworkSelect from './components/FrameworkSelect.vue';
import SizeComparisonChart from './components/SizeComparisonChart.vue';
import Tabs from './components/Tabs.vue';

export default {
  ...Theme,
  enhanceApp(params: any) {
    Theme.enhanceApp(params);

    params.app.component('FrameworkSelect', FrameworkSelect);
    params.app.component('Tabs', Tabs);
    params.app.component('ComparisonTable', ComparisonTable);
    params.app.component('SizeComparisonChart', SizeComparisonChart);
  },
};
