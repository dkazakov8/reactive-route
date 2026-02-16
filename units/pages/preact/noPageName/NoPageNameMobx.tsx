// @ts-expect-error
import { observer } from 'mobx-preact';

const NoPageName = observer(() => {
  return <div>No page name</div>;
});

export default NoPageName;
