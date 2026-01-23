import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './router';

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
};

export default App;
