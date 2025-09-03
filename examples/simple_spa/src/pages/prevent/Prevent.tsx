import { observer } from 'mobx-react-lite';

const Prevent = observer(() => {
  return (
    <div>
      If you come from Dynamic page you will be redirected to Static page. Otherwise this page is
      rendered as usual
      <br />
      Also you can not leave from this page to Query page
    </div>
  );
});


export default Prevent;
