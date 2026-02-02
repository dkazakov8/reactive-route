import Accordion from './.vitepress/theme/components/Accordion.vue';
import CodeView from './.vitepress/theme/components/CodeView.vue';
import ComparisonTable from './.vitepress/theme/components/ComparisonTable.vue';
import FrameworkSelect from './.vitepress/theme/components/FrameworkSelect.vue';
import Link from './.vitepress/theme/components/Link.vue';
import SizeComparisonChart from './.vitepress/theme/components/SizeComparisonChart.vue';
import Tabs from './.vitepress/theme/components/Tabs.vue';

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    Accordion: typeof Accordion;
    FrameworkSelect: typeof FrameworkSelect;
    Tabs: typeof Tabs;
    ComparisonTable: typeof ComparisonTable;
    SizeComparisonChart: typeof SizeComparisonChart;
    CodeView: typeof CodeView;
    Link: typeof Link;
  }
}
